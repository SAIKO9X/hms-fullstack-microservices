package com.hms.pharmacy.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record MedicineInventoryRequest(
  @NotNull Long medicineId,
  @NotBlank String batchNo,
  @NotNull @Positive Integer quantity,
  @NotNull @Future LocalDate expiryDate
) {
}