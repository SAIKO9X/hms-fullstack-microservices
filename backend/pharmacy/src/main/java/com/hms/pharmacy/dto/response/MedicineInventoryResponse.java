package com.hms.pharmacy.dto.response;

import com.hms.pharmacy.entities.MedicineInventory;

import java.time.LocalDate;

public record MedicineInventoryResponse(
  Long id,
  Long medicineId,
  String medicineName,
  String batchNo,
  Integer quantity,
  LocalDate expiryDate,
  LocalDate addedDate
) {
  public static MedicineInventoryResponse fromEntity(MedicineInventory inventory) {
    return new MedicineInventoryResponse(
      inventory.getId(),
      inventory.getMedicine().getId(),
      inventory.getMedicine().getName(),
      inventory.getBatchNo(),
      inventory.getQuantity(),
      inventory.getExpiryDate(),
      inventory.getAddedDate()
    );
  }
}