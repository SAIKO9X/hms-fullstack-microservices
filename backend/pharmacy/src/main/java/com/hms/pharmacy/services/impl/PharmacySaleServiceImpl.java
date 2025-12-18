package com.hms.pharmacy.services.impl;

import com.hms.pharmacy.clients.AppointmentFeignClient;
import com.hms.pharmacy.clients.ProfileFeignClient;
import com.hms.pharmacy.clients.UserFeignClient;
import com.hms.pharmacy.dto.request.*;
import com.hms.pharmacy.dto.response.*;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.entities.PharmacySale;
import com.hms.pharmacy.entities.PharmacySaleItem;
import com.hms.pharmacy.exceptions.MedicineNotFoundException;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.repositories.PharmacySaleRepository;
import com.hms.pharmacy.services.MedicineInventoryService;
import com.hms.pharmacy.services.PharmacySaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacySaleServiceImpl implements PharmacySaleService {

  private final PharmacySaleRepository saleRepository;
  private final MedicineRepository medicineRepository;
  private final MedicineInventoryService inventoryService;
  private final ProfileFeignClient profileFeignClient;
  private final AppointmentFeignClient appointmentFeignClient;
  private final RabbitTemplate rabbitTemplate;
  private final UserFeignClient userFeignClient;

  @Override
  @Transactional
  public PharmacySaleResponse createSale(PharmacySaleRequest request) {
    // Validação para evitar vendas duplicadas para a mesma prescrição
    if (request.originalPrescriptionId() != null && saleRepository.existsByOriginalPrescriptionId(request.originalPrescriptionId())) {
      throw new IllegalStateException("Já existe uma venda para esta prescrição.");
    }

    PatientProfileResponse patient;
    try {
      patient = profileFeignClient.getPatientProfileByUserId(request.patientId());
    } catch (Exception e) {
      System.err.println("Falha ao buscar perfil do paciente via Feign. Causa: " + e.getMessage());
      throw new NoSuchElementException("Não foi possível obter os dados do paciente com ID " + request.patientId() + ". O serviço de perfis pode estar indisponível ou a requisição foi negada.");
    }

    String patientEmail = null;
    try {
      UserResponse user = userFeignClient.getUserById(request.patientId());
      patientEmail = user.email();
    } catch (Exception e) {
      System.err.println("Falha ao buscar e-mail do usuário: " + e.getMessage());
    }

    PharmacySale sale = new PharmacySale();
    sale.setOriginalPrescriptionId(request.originalPrescriptionId());
    sale.setPatientId(patient.userId());
    sale.setBuyerName(patient.name());
    sale.setBuyerContact(patient.phoneNumber());

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

    if (patientEmail != null) {
      try {
        String emailBody = String.format(
          "<h1>Olá, %s!</h1><p>Sua compra foi realizada com sucesso.</p><p>Valor Total: R$ %s</p>",
          savedSale.getBuyerName(),
          savedSale.getTotalAmount().toString()
        );

        // Usa o e-mail vindo do User Service
        EmailRequest emailRequest = new EmailRequest(
          patientEmail,
          "Comprovante de Compra - HMS Pharmacy",
          emailBody
        );

        rabbitTemplate.convertAndSend("internal.exchange", "notification.email", emailRequest);
        System.out.println("Solicitação de e-mail enviada para: " + patientEmail);
      } catch (Exception e) {
        System.err.println("Erro ao enviar notificação de venda: " + e.getMessage());
      }
    } else {
      System.err.println("Notificação ignorada: E-mail do paciente não encontrado.");
    }

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
    PrescriptionReceiveRequest prescriptionRequest = appointmentFeignClient.getPrescriptionForPharmacy(prescriptionId);

    List<SaleItemRequest> saleItems = prescriptionRequest.items().stream()
      .map(item -> {
        // Buscara o medicamento pelo nome e dosagem para encontrar o ID interno da farmácia
        Medicine medicine = medicineRepository
          .findByNameIgnoreCaseAndDosageIgnoreCase(item.medicineName(), item.dosage())
          .orElseThrow(() -> new MedicineNotFoundException(
            "Medicamento '" + item.medicineName() + " " + item.dosage() + "' não encontrado no estoque."
          ));

        return new SaleItemRequest(medicine.getId(), item.quantity());
      })
      .collect(Collectors.toList());

    PharmacySaleRequest saleRequest = new PharmacySaleRequest(
      prescriptionRequest.originalPrescriptionId(),
      prescriptionRequest.patientId(),
      saleItems
    );

    return createSale(saleRequest);
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

    // Calcula a receita total
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

    //  Irá ordenar pela data crescente
    dailyBreakdown.sort(Comparator.comparing(DailyRevenueDto::date));

    return new PharmacyFinancialStatsResponse(totalRevenue, dailyBreakdown);
  }
}