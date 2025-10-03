package com.hms.pharmacy.request;

import com.hms.pharmacy.enums.MedicineCategory;
import com.hms.pharmacy.enums.MedicineType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record MedicineRequest(
  @NotBlank String name,
  String dosage,
  @NotNull MedicineCategory category,
  @NotNull MedicineType type,
  @NotBlank String manufacturer,
  @NotNull @DecimalMin("0.01") BigDecimal unitPrice
) {
}