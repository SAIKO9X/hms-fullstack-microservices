package com.hms.appointment.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record HealthMetricCreateRequest(
  String bloodPressure,
  @Positive(message = "O nível de glicose deve ser positivo.")
  Double glucoseLevel,
  @NotNull(message = "O peso é obrigatório.")
  @Positive(message = "O peso deve ser positivo.")
  Double weight,
  @NotNull(message = "A altura é obrigatória.")
  @Positive(message = "A altura deve ser positiva.")
  Double height,
  @Positive(message = "A frequência cardíaca deve ser positiva.")
  Integer heartRate
) {
}