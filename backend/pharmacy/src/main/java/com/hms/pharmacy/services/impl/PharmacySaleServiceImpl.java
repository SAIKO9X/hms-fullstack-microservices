package com.hms.pharmacy.services.impl;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

  @Override
  @Transactional
  public PharmacySaleResponse createSale(PharmacySaleRequest request) {
    if (request.originalPrescriptionId() != null && saleRepository.existsByOriginalPrescriptionId(request.originalPrescriptionId())) {
      throw new IllegalStateException("Já existe uma venda para esta prescrição.");
    }

    PatientReadModel patient = patientReadModelRepository.findById(request.patientId())
      .orElseGet(() -> {
        // Fallback se a sincronização falhar ou não tiver ocorrido
        log.warn("Paciente ID {} não encontrado no ReadModel da Farmácia. Usando dados genéricos.", request.patientId());
        PatientReadModel unknown = new PatientReadModel();
        unknown.setUserId(request.patientId());
        unknown.setName("Paciente (Não Sincronizado)");
        unknown.setPhoneNumber("N/A");
        unknown.setEmail(null);
        return unknown;
      });

    String patientEmail = patient.getEmail();

    PharmacySale sale = new PharmacySale();
    sale.setOriginalPrescriptionId(request.originalPrescriptionId());
    sale.setPatientId(request.patientId());
    sale.setBuyerName(patient.getName());
    sale.setBuyerContact(patient.getPhoneNumber());

    BigDecimal totalAmount = BigDecimal.ZERO;
    List<PharmacySaleItem> saleItems = new ArrayList<>();

    for (SaleItemRequest itemRequest : request.items()) {
      Medicine medicine = medicineRepository.findById(itemRequest.medicineId())
        .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + itemRequest.medicineId() + " não encontrado."));

      String batchDetails = inventoryService.sellStock(itemRequest.medicineId(), itemRequest.quantity());

      PharmacySaleItem saleItem = new PharmacySaleItem();
      saleItem.setSale(sale);
      saleItem.setMedicineId(medicine.getId());
      saleItem.setMedicineName(medicine.getName() + " " + medicine.getDosage());
      saleItem.setQuantity(itemRequest.quantity());
      saleItem.setUnitPrice(medicine.getUnitPrice());
      saleItem.setTotalPrice(medicine.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
      saleItem.setBatchNo(batchDetails);

      saleItems.add(saleItem);
      totalAmount = totalAmount.add(saleItem.getTotalPrice());
    }

    sale.setItems(saleItems);
    sale.setTotalAmount(totalAmount);

    PharmacySale savedSale = saleRepository.save(sale);

    sendEmailNotification(patientEmail, savedSale);

    return PharmacySaleResponse.fromEntity(savedSale);
  }

  @Override
  public PharmacySaleResponse getSaleById(Long saleId) {
    return saleRepository.findById(saleId)
      .map(PharmacySaleResponse::fromEntity)
      .orElseThrow(() -> new NoSuchElementException("Venda com ID " + saleId + " não encontrada."));
  }

  @Override
  public List<PharmacySaleResponse> getSalesByPatientId(Long patientId) {
    return saleRepository.findByPatientId(patientId).stream()
      .map(PharmacySaleResponse::fromEntity)
      .toList();
  }


  @Override
  public Page<PharmacySaleResponse> getAllSales(Pageable pageable) {
    return saleRepository.findAll(pageable)
      .map(PharmacySaleResponse::fromEntity);
  }

  @Override
  @Transactional
  public PharmacySaleResponse processPrescriptionAndCreateSale(Long prescriptionId) {
    if (prescriptionId == null) {
      throw new IllegalArgumentException("O ID da prescrição é obrigatório.");
    }

    // Busca na Tabela Local
    PrescriptionCopy prescription = prescriptionCopyRepository.findById(prescriptionId)
      .orElseThrow(() -> new IllegalArgumentException("Receita não encontrada ou ainda não sincronizada na Farmácia. ID: " + prescriptionId));

    if (prescription.getValidUntil().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Esta receita expirou em: " + prescription.getValidUntil());
    }

    if (prescription.isProcessed()) {
      throw new IllegalArgumentException("Esta receita já foi utilizada.");
    }

    List<PrescriptionItemDto> prescriptionItems;
    try {
      prescriptionItems = objectMapper.readValue(
        prescription.getItemsJson(),
        new TypeReference<List<PrescriptionItemDto>>() {
        }
      );
    } catch (JsonProcessingException e) {
      throw new RuntimeException("Erro ao processar os itens da receita armazenada.", e);
    }

    // Mapeia Itens da Receita -> Itens de Venda
    List<SaleItemRequest> saleItems = prescriptionItems.stream()
      .map(item -> {
        Medicine medicine = medicineRepository
          .findByNameIgnoreCaseAndDosageIgnoreCase(item.medicineName(), item.dosage())
          .orElseThrow(() -> new MedicineNotFoundException(
            "Medicamento '" + item.medicineName() + " " + item.dosage() + "' prescrito não encontrado no estoque."
          ));

        int quantityToSell = (item.durationDays() != null && item.durationDays() > 0) ? item.durationDays() : 1;

        return new SaleItemRequest(medicine.getId(), quantityToSell);
      })
      .collect(Collectors.toList());

    PharmacySaleRequest saleRequest = new PharmacySaleRequest(
      prescriptionId,
      prescription.getPatientId(),
      saleItems
    );

    PharmacySaleResponse response = createSale(saleRequest);

    prescription.setProcessed(true);
    prescriptionCopyRepository.save(prescription);

    return response;
  }

  @Override
  @Transactional
  public PharmacySaleResponse createDirectSale(DirectSaleRequest request) {
    PharmacySaleRequest saleRequest = new PharmacySaleRequest(
      null, // ID da prescrição é nulo para venda direta
      request.patientId(),
      request.items()
    );
    return createSale(saleRequest);
  }

  @Override
  public PharmacyFinancialStatsResponse getFinancialStatsLast30Days() {
    LocalDateTime endDate = LocalDateTime.now();
    LocalDateTime startDate = endDate.minusDays(30);

    List<PharmacySale> sales = saleRepository.findBySaleDateBetween(startDate, endDate);

    BigDecimal totalRevenue = sales.stream()
      .map(PharmacySale::getTotalAmount)
      .reduce(BigDecimal.ZERO, BigDecimal::add);

    Map<LocalDate, BigDecimal> salesByDate = sales.stream()
      .collect(Collectors.groupingBy(
        sale -> sale.getSaleDate().toLocalDate(),
        Collectors.reducing(BigDecimal.ZERO, PharmacySale::getTotalAmount, BigDecimal::add)
      ));

    List<DailyRevenueDto> dailyBreakdown = new ArrayList<>();
    for (int i = 0; i <= 30; i++) {
      LocalDate date = LocalDate.now().minusDays(i);
      BigDecimal amount = salesByDate.getOrDefault(date, BigDecimal.ZERO);
      dailyBreakdown.add(new DailyRevenueDto(date, amount));
    }

    dailyBreakdown.sort(Comparator.comparing(DailyRevenueDto::date));

    return new PharmacyFinancialStatsResponse(totalRevenue, dailyBreakdown);
  }

  // Método auxiliar para enviar notificação por e-mail via RabbitMQ
  private void sendEmailNotification(String patientEmail, PharmacySale savedSale) {
    if (patientEmail != null) {
      try {
        String emailBody = String.format(
          "<h1>Olá, %s!</h1><p>Sua compra na Farmácia foi realizada com sucesso.</p><p>Valor Total: R$ %s</p><p>Protocolo: %s</p>",
          savedSale.getBuyerName(),
          savedSale.getTotalAmount().toString(),
          savedSale.getId()
        );

        EmailRequest emailRequest = new EmailRequest(
          patientEmail,
          "Comprovante de Compra - HMS Pharmacy",
          emailBody
        );

        rabbitTemplate.convertAndSend(exchange, "notification.email", emailRequest);
        log.info("Solicitação de e-mail enviada para: {}", patientEmail);
      } catch (Exception e) {
        log.error("Erro ao enviar notificação de venda: {}", e.getMessage());
      }
    } else {
      log.warn("Notificação ignorada: E-mail do paciente não encontrado.");
    }
  }

  // Record auxiliar para desserializar o JSON salvo na PrescriptionCopy
  @JsonIgnoreProperties(ignoreUnknown = true)
  private record PrescriptionItemDto(
    String medicineName,
    String dosage,
    String frequency,
    Integer durationDays,
    String instructions
  ) {
  }
}