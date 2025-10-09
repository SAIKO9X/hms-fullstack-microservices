package com.hms.pharmacy.dto.response;

import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.enums.MedicineCategory;
import com.hms.pharmacy.enums.MedicineType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MedicineResponse(
  Long id,
  String name,
  String dosage,
  MedicineCategory category,
  MedicineType type,
  String manufacturer,
  BigDecimal unitPrice,
  Integer totalStock,
  LocalDateTime createdAt
) {
  public static MedicineResponse fromEntity(Medicine medicine) {
    return new MedicineResponse(
      medicine.getId(),
      medicine.getName(),
      medicine.getDosage(),
      medicine.getCategory(),
      medicine.getType(),
      medicine.getManufacturer(),
      medicine.getUnitPrice(),
      medicine.getTotalStock(),
      medicine.getCreatedAt()
    );
  }
}