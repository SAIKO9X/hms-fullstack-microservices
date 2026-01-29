package com.hms.pharmacy.services.impl;

import com.hms.pharmacy.dto.event.StockLowEvent;
import com.hms.pharmacy.dto.request.MedicineInventoryRequest;
import com.hms.pharmacy.dto.response.MedicineInventoryResponse;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.entities.MedicineInventory;
import com.hms.pharmacy.enums.StockStatus;
import com.hms.pharmacy.exceptions.InsufficientStockException;
import com.hms.pharmacy.exceptions.MedicineNotFoundException;
import com.hms.pharmacy.repositories.MedicineInventoryRepository;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.services.MedicineInventoryService;
import com.hms.pharmacy.services.MedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MedicineInventoryServiceImpl implements MedicineInventoryService {

  private final MedicineInventoryRepository inventoryRepository;
  private final RabbitTemplate rabbitTemplate;
  private final MedicineRepository medicineRepository;
  private final MedicineService medicineService;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  private static final int LOW_STOCK_THRESHOLD = 10;

  @Override
  public MedicineInventoryResponse addInventory(MedicineInventoryRequest request) {
    Medicine medicine = medicineRepository.findById(request.medicineId())
      .orElseThrow(() -> new MedicineNotFoundException("Medicamento não encontrado: " + request.medicineId()));

    MedicineInventory newInventory = new MedicineInventory();
    newInventory.setMedicine(medicine);
    newInventory.setBatchNo(request.batchNo());
    newInventory.setQuantity(request.quantity());
    newInventory.setExpiryDate(request.expiryDate());
    newInventory.setAddedDate(LocalDate.now());
    newInventory.setStatus(StockStatus.ACTIVE);

    MedicineInventory saved = inventoryRepository.save(newInventory);
    medicineService.addStock(request.medicineId(), request.quantity());

    return MedicineInventoryResponse.fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<MedicineInventoryResponse> getAllInventory(Pageable pageable) {
    return inventoryRepository.findAll(pageable).map(MedicineInventoryResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public MedicineInventoryResponse getInventoryById(Long id) {
    return inventoryRepository.findById(id).map(MedicineInventoryResponse::fromEntity).orElseThrow(() -> new MedicineNotFoundException("Inventário não encontrado: " + id));
  }

  @Override
  public MedicineInventoryResponse updateInventory(Long inventoryId, MedicineInventoryRequest request) {
    MedicineInventory inventory = inventoryRepository.findById(inventoryId)
      .orElseThrow(() -> new MedicineNotFoundException("Inventário não encontrado: " + inventoryId));

    updateStockDifference(inventory, request.quantity());

    inventory.setBatchNo(request.batchNo());
    inventory.setQuantity(request.quantity());
    inventory.setExpiryDate(request.expiryDate());
    inventory.setStatus(request.quantity() <= 0 ? StockStatus.DEPLETED : StockStatus.ACTIVE);

    return MedicineInventoryResponse.fromEntity(inventoryRepository.save(inventory));
  }

  @Override
  public void deleteInventory(Long inventoryId) {
    MedicineInventory inventory = inventoryRepository.findById(inventoryId)
      .orElseThrow(() -> new MedicineNotFoundException("Inventário não encontrado: " + inventoryId));

    medicineService.removeStock(inventory.getMedicine().getId(), inventory.getQuantity());
    inventoryRepository.delete(inventory);
  }

  @Override
  public String sellStock(Long medicineId, Integer quantityToSell) {
    List<MedicineInventory> batches = inventoryRepository
      .findByMedicineIdAndStatusAndQuantityGreaterThanOrderByExpiryDateAsc(medicineId, StockStatus.ACTIVE, 0);

    int totalAvailable = batches.stream().mapToInt(MedicineInventory::getQuantity).sum();
    if (totalAvailable < quantityToSell) {
      throw new InsufficientStockException("Estoque insuficiente. Disponível: " + totalAvailable);
    }

    StringBuilder batchDetails = new StringBuilder();
    int remaining = quantityToSell;

    for (MedicineInventory batch : batches) {
      if (remaining <= 0) break;

      int taken = Math.min(batch.getQuantity(), remaining);
      batch.setQuantity(batch.getQuantity() - taken);
      if (batch.getQuantity() <= 0) batch.setStatus(StockStatus.DEPLETED);

      remaining -= taken;
      batchDetails.append(String.format("Lote %s: %d; ", batch.getBatchNo(), taken));
    }

    inventoryRepository.saveAll(batches);
    medicineService.removeStock(medicineId, quantityToSell);
    checkLowStock(medicineId, totalAvailable - quantityToSell, batches.get(0).getMedicine().getName());

    return batchDetails.toString().trim();
  }

  private void updateStockDifference(MedicineInventory inventory, int newQuantity) {
    int diff = newQuantity - inventory.getQuantity();
    if (diff > 0) medicineService.addStock(inventory.getMedicine().getId(), diff);
    else if (diff < 0) medicineService.removeStock(inventory.getMedicine().getId(), -diff);
  }

  private void checkLowStock(Long medicineId, int remainingStock, String medicineName) {
    if (remainingStock <= LOW_STOCK_THRESHOLD) {
      try {
        StockLowEvent event = new StockLowEvent(medicineId, medicineName, remainingStock, LOW_STOCK_THRESHOLD);
        rabbitTemplate.convertAndSend(exchange, "pharmacy.stock.low", event);
        log.info("Alerta de stock baixo: {}", medicineName);
      } catch (Exception e) {
        log.error("Erro ao enviar alerta de stock baixo", e);
      }
    }
  }
}