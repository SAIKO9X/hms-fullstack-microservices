package com.hms.pharmacy.services.impl;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.pharmacy.dto.event.PharmacySaleCreatedEvent;
import com.hms.pharmacy.dto.event.PrescriptionDispensedEvent;
import com.hms.pharmacy.dto.request.DirectSaleRequest;
import com.hms.pharmacy.dto.request.EmailRequest;
import com.hms.pharmacy.dto.request.PharmacySaleRequest;
import com.hms.pharmacy.dto.request.SaleItemRequest;
import com.hms.pharmacy.dto.response.DailyRevenueDto;
import com.hms.pharmacy.dto.response.PharmacyFinancialStatsResponse;
import com.hms.pharmacy.dto.response.PharmacySaleResponse;
import com.hms.pharmacy.entities.*;
import com.hms.pharmacy.exceptions.MedicineNotFoundException;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.repositories.PatientReadModelRepository;
import com.hms.pharmacy.repositories.PharmacySaleRepository;
import com.hms.pharmacy.repositories.PrescriptionCopyRepository;
import com.hms.pharmacy.services.MedicineInventoryService;
import com.hms.pharmacy.services.PharmacySaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PharmacySaleServiceImpl implements PharmacySaleService {

  private final PharmacySaleRepository saleRepository;
  private final MedicineRepository medicineRepository;
  private final MedicineInventoryService inventoryService;
  private final RabbitTemplate rabbitTemplate;
  private final PrescriptionCopyRepository prescriptionCopyRepository;
  private final ObjectMapper objectMapper;
  private final PatientReadModelRepository patientReadModelRepository;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.prescription-dispensed-routing-key:prescription.dispensed}")
  private String prescriptionDispensedRoutingKey;

  private static final String PHARMACY_SALE_ROUTING_KEY = "pharmacy.sale.created";

  @Override
  @Transactional
  public PharmacySaleResponse createSale(PharmacySaleRequest request) {
    validateDuplicateSale(request.originalPrescriptionId());

    PatientReadModel patient = resolvePatient(request.patientId());

    PharmacySale sale = initializeSale(request, patient);
    processSaleItems(request.items(), sale);

    PharmacySale savedSale = saleRepository.save(sale);

    publishFinancialEvent(savedSale);
    sendEmailNotification(patient.getEmail(), savedSale);

    return PharmacySaleResponse.fromEntity(savedSale);
  }

  @Override
  @Transactional
  public PharmacySaleResponse processPrescriptionAndCreateSale(Long prescriptionId) {
    PrescriptionCopy prescription = validatePrescription(prescriptionId);

    List<SaleItemRequest> saleItems = mapPrescriptionToSaleItems(prescription);
    PharmacySaleRequest saleRequest = new PharmacySaleRequest(prescriptionId, prescription.getPatientId(), saleItems);

    PharmacySaleResponse response = createSale(saleRequest);

    markPrescriptionProcessed(prescription, response.id());
    return response;
  }

  @Override
  @Transactional
  public PharmacySaleResponse createDirectSale(DirectSaleRequest request) {
    return createSale(new PharmacySaleRequest(null, request.patientId(), request.items()));
  }

  @Override
  public PharmacySaleResponse getSaleById(Long id) {
    return saleRepository.findById(id).map(PharmacySaleResponse::fromEntity).orElseThrow(() -> new NoSuchElementException("Venda não encontrada: " + id));
  }

  @Override
  public List<PharmacySaleResponse> getSalesByPatientId(Long id) {
    return saleRepository.findByPatientId(id).stream().map(PharmacySaleResponse::fromEntity).toList();
  }

  @Override
  public Page<PharmacySaleResponse> getAllSales(Pageable pageable) {
    return saleRepository.findAll(pageable).map(PharmacySaleResponse::fromEntity);
  }

  @Override
  public PharmacyFinancialStatsResponse getFinancialStatsLast30Days() {
    LocalDateTime end = LocalDateTime.now();
    LocalDateTime start = end.minusDays(30);
    List<PharmacySale> sales = saleRepository.findBySaleDateBetween(start, end);

    BigDecimal total = sales.stream().map(PharmacySale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

    Map<LocalDate, BigDecimal> dailyMap = sales.stream().collect(Collectors.groupingBy(
      s -> s.getSaleDate().toLocalDate(), Collectors.reducing(BigDecimal.ZERO, PharmacySale::getTotalAmount, BigDecimal::add)));

    List<DailyRevenueDto> daily = new ArrayList<>();
    for (int i = 0; i <= 30; i++) {
      LocalDate d = LocalDate.now().minusDays(i);
      daily.add(new DailyRevenueDto(d, dailyMap.getOrDefault(d, BigDecimal.ZERO)));
    }
    daily.sort(Comparator.comparing(DailyRevenueDto::date));

    return new PharmacyFinancialStatsResponse(total, daily);
  }

  private void validateDuplicateSale(Long prescriptionId) {
    if (prescriptionId != null && saleRepository.existsByOriginalPrescriptionId(prescriptionId)) {
      throw new IllegalStateException("Venda já registrada para esta prescrição.");
    }
  }

  private PatientReadModel resolvePatient(Long patientId) {
    return patientReadModelRepository.findById(patientId).orElseGet(() -> {
      log.warn("Paciente ID {} desconhecido. Usando fallback.", patientId);
      var p = new PatientReadModel();
      p.setUserId(patientId);
      p.setName("Cliente (Não Identificado)");
      p.setPhoneNumber("N/A");
      return p;
    });
  }

  private PharmacySale initializeSale(PharmacySaleRequest req, PatientReadModel p) {
    PharmacySale sale = new PharmacySale();
    sale.setOriginalPrescriptionId(req.originalPrescriptionId());
    sale.setPatientId(req.patientId());
    sale.setBuyerName(p.getName());
    sale.setBuyerContact(p.getPhoneNumber());
    sale.setSaleDate(LocalDateTime.now());
    return sale;
  }

  private void processSaleItems(List<SaleItemRequest> items, PharmacySale sale) {
    List<PharmacySaleItem> saleItems = new ArrayList<>();
    BigDecimal total = BigDecimal.ZERO;

    for (SaleItemRequest item : items) {
      Medicine med = medicineRepository.findById(item.medicineId())
        .orElseThrow(() -> new MedicineNotFoundException("Medicamento não encontrado: " + item.medicineId()));

      String batchInfo = inventoryService.sellStock(item.medicineId(), item.quantity());

      PharmacySaleItem saleItem = new PharmacySaleItem();
      saleItem.setSale(sale);
      saleItem.setMedicineId(med.getId());
      saleItem.setMedicineName(med.getName() + " " + med.getDosage());
      saleItem.setQuantity(item.quantity());
      saleItem.setUnitPrice(med.getUnitPrice());
      saleItem.setTotalPrice(med.getUnitPrice().multiply(BigDecimal.valueOf(item.quantity())));
      saleItem.setBatchNo(batchInfo);

      saleItems.add(saleItem);
      total = total.add(saleItem.getTotalPrice());
    }
    sale.setItems(saleItems);
    sale.setTotalAmount(total);
  }

  private PrescriptionCopy validatePrescription(Long id) {
    PrescriptionCopy p = prescriptionCopyRepository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Receita não encontrada: " + id));
    if (p.getValidUntil().isBefore(LocalDate.now())) throw new IllegalArgumentException("Receita expirada.");
    if (p.isProcessed()) throw new IllegalArgumentException("Receita já processada.");
    return p;
  }

  private List<SaleItemRequest> mapPrescriptionToSaleItems(PrescriptionCopy p) {
    try {
      List<PrescriptionItemDto> items = objectMapper.readValue(p.getItemsJson(), new TypeReference<>() {
      });
      return items.stream().map(i -> {
        Medicine m = medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(i.medicineName(), i.dosage())
          .orElseThrow(() -> new MedicineNotFoundException("Item não encontrado no estoque: " + i.medicineName()));
        return new SaleItemRequest(m.getId(), (i.durationDays() != null && i.durationDays() > 0) ? i.durationDays() : 1);
      }).toList();
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Erro ao processar JSON da receita", e);
    }
  }

  private void markPrescriptionProcessed(PrescriptionCopy p, Long saleId) {
    p.setProcessed(true);
    prescriptionCopyRepository.save(p);
    try {
      rabbitTemplate.convertAndSend(exchange, prescriptionDispensedRoutingKey,
        new PrescriptionDispensedEvent(p.getPrescriptionId(), saleId, LocalDateTime.now()));
    } catch (Exception e) {
      log.error("Erro ao notificar receita aviada", e);
    }
  }

  private void publishFinancialEvent(PharmacySale sale) {
    try {
      rabbitTemplate.convertAndSend(exchange, PHARMACY_SALE_ROUTING_KEY,
        new PharmacySaleCreatedEvent(sale.getId(), sale.getPatientId(), sale.getBuyerName(), sale.getTotalAmount(), sale.getSaleDate()));
    } catch (Exception e) {
      log.error("Erro RabbitMQ Financeiro", e);
    }
  }

  private void sendEmailNotification(String email, PharmacySale sale) {
    if (email == null) return;
    try {
      String body = String.format("<h1>Olá, %s!</h1><p>Compra confirmada.</p><p>Total: %s</p>", sale.getBuyerName(), sale.getTotalAmount());
      rabbitTemplate.convertAndSend(exchange, "notification.email", new EmailRequest(email, "Comprovante - HMS", body));
    } catch (Exception e) {
      log.error("Erro RabbitMQ Email", e);
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PrescriptionItemDto(String medicineName, String dosage, Integer durationDays) {
    // durationDays é opcional e pode ser nulo
  }
}