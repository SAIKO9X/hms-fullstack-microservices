package com.hms.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MedicineRequest(
  @NotBlank String name,
  @NotBlank String dosage,
  @NotBlank String frequency,
  @NotNull @Positive Integer duration
) {
}