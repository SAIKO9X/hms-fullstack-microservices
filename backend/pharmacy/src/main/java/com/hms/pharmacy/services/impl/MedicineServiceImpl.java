package com.hms.pharmacy.services.impl;

import com.hms.common.dto.event.EventEnvelope;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceAlreadyExistsException;
import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.pharmacy.config.RabbitMQConfig;
import com.hms.pharmacy.dto.event.StockLowEvent;
import com.hms.pharmacy.dto.request.MedicineRequest;
import com.hms.pharmacy.dto.response.MedicineResponse;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.services.MedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

  private final MedicineRepository medicineRepository;
  private final RabbitTemplate rabbitTemplate;

  @Value("${application.rabbitmq.exchange:hms.exchange}")
  private String exchange;

  @Override
  @Transactional
  public MedicineResponse addMedicine(MedicineRequest request) {
    medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(request.name(), request.dosage())
      .ifPresent(m -> {
        throw new ResourceAlreadyExistsException("Medicine", request.name() + " (" + request.dosage() + ")");
      });

    Medicine newMedicine = new Medicine();
    mapRequestToEntity(request, newMedicine);
    if (newMedicine.getTotalStock() == null) newMedicine.setTotalStock(0);

    return MedicineResponse.fromEntity(medicineRepository.save(newMedicine));
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public MedicineResponse updateMedicine(Long medicineId, MedicineRequest request) {
    Medicine existingMedicine = findMedicineById(medicineId);

    medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(request.name(), request.dosage())
      .ifPresent(m -> {
        if (!m.getId().equals(medicineId)) {
          throw new ResourceAlreadyExistsException("Medicine", request.name() + " (" + request.dosage() + ")");
        }
      });

    mapRequestToEntity(request, existingMedicine);

    return MedicineResponse.fromEntity(medicineRepository.save(existingMedicine));
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "medicines", key = "#medicineId")
  public MedicineResponse getMedicineById(Long medicineId) {
    return medicineRepository.findById(medicineId)
      .map(MedicineResponse::fromEntity)
      .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<MedicineResponse> getAllMedicines(Pageable pageable) {
    return medicineRepository.findAll(pageable)
      .map(MedicineResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public Integer getStockById(Long medicineId) {
    return medicineRepository.findStockById(medicineId)
      .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public Integer addStock(Long medicineId, Integer quantity) {
    if (quantity <= 0) {
      throw new InvalidOperationException("A quantidade a adicionar deve ser positiva.");
    }
    Medicine medicine = findMedicineById(medicineId);
    medicine.setTotalStock(medicine.getTotalStock() + quantity);
    return medicineRepository.save(medicine).getTotalStock();
  }

  @Override
  @Transactional
  @CacheEvict(value = "medicines", key = "#medicineId")
  public Integer removeStock(Long medicineId, Integer quantity) {
    if (quantity <= 0) {
      throw new InvalidOperationException("A quantidade a remover deve ser positiva.");
    }
    Medicine medicine = findMedicineById(medicineId);
    if (medicine.getTotalStock() < quantity) {
      throw new InvalidOperationException("Stock insuficiente para o medicamento: " + medicine.getName());
    }

    int newStock = medicine.getTotalStock() - quantity;
    medicine.setTotalStock(newStock);
    Medicine saved = medicineRepository.save(medicine);

    // --- Verificar Nível Crítico e Disparar Evento ---
    int threshold = 10;
    if (newStock <= threshold) {
      checkAndPublishLowStockEvent(saved, threshold);
    }

    return saved.getTotalStock();
  }

  private void checkAndPublishLowStockEvent(Medicine medicine, int threshold) {
    try {
      StockLowEvent event = new StockLowEvent(
        medicine.getId(),
        medicine.getName(),
        medicine.getTotalStock(),
        threshold
      );

      EventEnvelope<StockLowEvent> envelope = EventEnvelope.create(
        "MEDICINE_STOCK_LOW",
        String.valueOf(medicine.getId()),
        event
      );

      rabbitTemplate.convertAndSend(exchange, RabbitMQConfig.STOCK_LOW_ROUTING_KEY, envelope);
      log.warn("Alerta de Stock Baixo enviado para medicamento: {}", medicine.getName());

    } catch (Exception e) {
      log.error("Erro ao enviar alerta de stock: {}", e.getMessage());
    }
  }

  private Medicine findMedicineById(Long medicineId) {
    return medicineRepository.findById(medicineId)
      .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
  }

  private void mapRequestToEntity(MedicineRequest request, Medicine medicine) {
    medicine.setName(request.name());
    medicine.setDosage(request.dosage());
    medicine.setCategory(request.category());
    medicine.setType(request.type());
    medicine.setManufacturer(request.manufacturer());
    medicine.setUnitPrice(request.unitPrice());
  }
}