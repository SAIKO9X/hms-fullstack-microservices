package com.hms.pharmacy.services.impl;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MedicineInventoryServiceImpl implements MedicineInventoryService {

  private final MedicineInventoryRepository inventoryRepository;
  private final MedicineRepository medicineRepository;
  private final MedicineService medicineService;

  @Override
  public MedicineInventoryResponse addInventory(MedicineInventoryRequest request) {
    Medicine medicine = medicineRepository.findById(request.medicineId())
      .orElseThrow(() -> new MedicineNotFoundException("Medicamento com ID " + request.medicineId() + " não encontrado."));

    MedicineInventory newInventory = new MedicineInventory();
    newInventory.setMedicine(medicine);
    newInventory.setBatchNo(request.batchNo());
    newInventory.setQuantity(request.quantity());
    newInventory.setExpiryDate(request.expiryDate());
    newInventory.setAddedDate(LocalDate.now());
    newInventory.setStatus(StockStatus.ACTIVE);

    MedicineInventory savedInventory = inventoryRepository.save(newInventory);

    medicineService.addStock(request.medicineId(), request.quantity());

    return MedicineInventoryResponse.fromEntity(savedInventory);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<MedicineInventoryResponse> getAllInventory(Pageable pageable) {
    return inventoryRepository.findAll(pageable)
      .map(MedicineInventoryResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public MedicineInventoryResponse getInventoryById(Long inventoryId) {
    return inventoryRepository.findById(inventoryId)
      .map(MedicineInventoryResponse::fromEntity)
      .orElseThrow(() -> new MedicineNotFoundException("Item de inventário com ID " + inventoryId + " não encontrado."));
  }

  @Override
  public MedicineInventoryResponse updateInventory(Long inventoryId, MedicineInventoryRequest request) {
    MedicineInventory inventoryToUpdate = inventoryRepository.findById(inventoryId)
      .orElseThrow(() -> new MedicineNotFoundException("Item de inventário com ID " + inventoryId + " não encontrado."));

    int oldQuantity = inventoryToUpdate.getQuantity();
    int newQuantity = request.quantity();
    int quantityDifference = newQuantity - oldQuantity;

    // Apenas atualiza o stock se a quantidade mudou
    if (quantityDifference != 0) {
      if (quantityDifference > 0) {
        medicineService.addStock(inventoryToUpdate.getMedicine().getId(), quantityDifference);
      } else {
        medicineService.removeStock(inventoryToUpdate.getMedicine().getId(), -quantityDifference);
      }
    }

    inventoryToUpdate.setBatchNo(request.batchNo());
    inventoryToUpdate.setQuantity(newQuantity);
    inventoryToUpdate.setExpiryDate(request.expiryDate());

    // Se a quantidade for zero marca como esgotado
    if (newQuantity <= 0) {
      inventoryToUpdate.setStatus(StockStatus.DEPLETED);
    } else {
      inventoryToUpdate.setStatus(StockStatus.ACTIVE);
    }

    return MedicineInventoryResponse.fromEntity(inventoryRepository.save(inventoryToUpdate));
  }

  @Override
  public void deleteInventory(Long inventoryId) {
    MedicineInventory inventory = inventoryRepository.findById(inventoryId)
      .orElseThrow(() -> new MedicineNotFoundException("Item de inventário com ID " + inventoryId + " não encontrado."));

    // Remove a quantidade do stock total ANTES de apagar
    medicineService.removeStock(inventory.getMedicine().getId(), inventory.getQuantity());

    inventoryRepository.delete(inventory);
  }

  @Override
  public String sellStock(Long medicineId, Integer quantityToSell) {
    List<MedicineInventory> availableBatches = inventoryRepository
      .findByMedicineIdAndStatusAndQuantityGreaterThanOrderByExpiryDateAsc(medicineId, StockStatus.ACTIVE, 0);

    int totalAvailable = availableBatches.stream().mapToInt(MedicineInventory::getQuantity).sum();
    if (totalAvailable < quantityToSell) {
      throw new InsufficientStockException("Estoque insuficiente. Disponível: " + totalAvailable + ", Requisitado: " + quantityToSell);
    }

    StringBuilder batchDetails = new StringBuilder();
    int remainingToSell = quantityToSell;

    for (MedicineInventory batch : availableBatches) {
      if (remainingToSell <= 0) {
        break; // Já foi vendida a quantidade necessária
      }

      int quantityFromThisBatch = Math.min(batch.getQuantity(), remainingToSell);
      batch.setQuantity(batch.getQuantity() - quantityFromThisBatch);
      remainingToSell -= quantityFromThisBatch;

      if (batch.getQuantity() <= 0) {
        batch.setStatus(StockStatus.DEPLETED);
      }

      batchDetails.append(String.format("Lote %s: %d unidades; ", batch.getBatchNo(), quantityFromThisBatch));
    }

    inventoryRepository.saveAll(availableBatches);
    medicineService.removeStock(medicineId, quantityToSell);
    return batchDetails.toString().trim();
  }
}