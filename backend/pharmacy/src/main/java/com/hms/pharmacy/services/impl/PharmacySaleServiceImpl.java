package com.hms.pharmacy.services.impl;

import com.hms.pharmacy.clients.AppointmentFeignClient;
import com.hms.pharmacy.clients.ProfileFeignClient;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.entities.PharmacySale;
import com.hms.pharmacy.entities.PharmacySaleItem;
import com.hms.pharmacy.exceptions.MedicineNotFoundException;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.repositories.PharmacySaleRepository;
import com.hms.pharmacy.request.DirectSaleRequest;
import com.hms.pharmacy.request.PharmacySaleRequest;
import com.hms.pharmacy.request.PrescriptionReceiveRequest;
import com.hms.pharmacy.request.SaleItemRequest;
import com.hms.pharmacy.response.PatientProfileResponse;
import com.hms.pharmacy.response.PharmacySaleResponse;
import com.hms.pharmacy.services.MedicineInventoryService;
import com.hms.pharmacy.services.PharmacySaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PharmacySaleServiceImpl implements PharmacySaleService {

  private final PharmacySaleRepository saleRepository;
  private final MedicineRepository medicineRepository;
  private final MedicineInventoryService inventoryService;
  private final ProfileFeignClient profileFeignClient;
  private final AppointmentFeignClient appointmentFeignClient;

  @Override
  @Transactional
  public PharmacySaleResponse createSale(PharmacySaleRequest request) {
    // Validação para evitar vendas duplicadas para a mesma prescrição
    if (saleRepository.existsByOriginalPrescriptionId(request.originalPrescriptionId())) {
      throw new IllegalStateException("Já existe uma venda para esta prescrição.");
    }

    // Busca os dados do paciente no profile-service
    PatientProfileResponse patient;
    try {
      patient = profileFeignClient.getPatientProfileByUserId(request.patientId());
    } catch (Exception e) {
      throw new NoSuchElementException("Perfil do paciente com ID " + request.patientId() + " não encontrado.");
    }


    PharmacySale sale = new PharmacySale();
    sale.setOriginalPrescriptionId(request.originalPrescriptionId());
    sale.setPatientId(patient.userId());
    sale.setBuyerName(patient.name());
    sale.setBuyerContact(patient.phoneNumber());

    BigDecimal totalAmount = BigDecimal.ZERO;
    List<PharmacySaleItem> saleItems = new ArrayList<>();

    // Processa cada item da venda
    for (SaleItemRequest itemRequest : request.items()) {
      Medicine medicine = medicineRepository.findById(itemRequest.medicineId())
        .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + itemRequest.medicineId() + " não encontrado."));

      // Deduz o estoque e obtém os detalhes do(s) lote(s) utilizado(s)
      String batchDetails = inventoryService.sellStock(itemRequest.medicineId(), itemRequest.quantity());

      // Cria o item da venda
      PharmacySaleItem saleItem = new PharmacySaleItem();
      saleItem.setSale(sale);
      saleItem.setMedicineId(medicine.getId());
      saleItem.setMedicineName(medicine.getName() + " " + medicine.getDosage()); // Salva nome e dosagem
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
  @Transactional
  public PharmacySaleResponse processPrescriptionAndCreateSale(PrescriptionReceiveRequest prescriptionRequest) {
    // Mapear os medicamentos da prescrição para os medicamentos do estoque da farmácia
    List<SaleItemRequest> saleItems = prescriptionRequest.items().stream()
      .map(item -> {
        // Busca o medicamento pelo nome e dosagem para encontrar o ID interno da farmácia
        Medicine medicine = medicineRepository
          .findByNameIgnoreCaseAndDosageIgnoreCase(item.medicineName(), item.dosage())
          .orElseThrow(() -> new MedicineNotFoundException(
            "Medicamento '" + item.medicineName() + " " + item.dosage() + "' não encontrado no estoque."
          ));

        return new SaleItemRequest(medicine.getId(), item.quantity());
      })
      .collect(Collectors.toList());

    // Monta o request para a criação da venda
    PharmacySaleRequest saleRequest = new PharmacySaleRequest(
      prescriptionRequest.originalPrescriptionId(),
      prescriptionRequest.patientId(),
      saleItems
    );

    return createSale(saleRequest);
  }

  @Override
  public List<PharmacySaleResponse> getAllSales() {
    return saleRepository.findAll().stream()
      .map(PharmacySaleResponse::fromEntity)
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public PharmacySaleResponse processPrescriptionAndCreateSale(Long prescriptionId) {
    PrescriptionReceiveRequest prescriptionRequest = appointmentFeignClient.getPrescriptionForPharmacy(prescriptionId);

    List<SaleItemRequest> saleItems = prescriptionRequest.items().stream()
      .map(item -> {
        // Busca o medicamento pelo nome e dosagem para encontrar o ID interno da farmácia
        Medicine medicine = medicineRepository
          .findByNameIgnoreCaseAndDosageIgnoreCase(item.medicineName(), item.dosage())
          .orElseThrow(() -> new MedicineNotFoundException(
            "Medicamento '" + item.medicineName() + " " + item.dosage() + "' não encontrado no estoque."
          ));

        return new SaleItemRequest(medicine.getId(), 1);
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
    // Mapeia o DirectSaleRequest para o PharmacySaleRequest que o createSale espera
    PharmacySaleRequest saleRequest = new PharmacySaleRequest(
      null, // ID da prescrição é nulo para venda direta
      request.patientId(),
      request.items()
    );
    return createSale(saleRequest);
  }
}