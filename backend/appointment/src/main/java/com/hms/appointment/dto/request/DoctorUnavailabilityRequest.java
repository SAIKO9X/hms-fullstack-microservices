package com.hms.appointment.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record DoctorUnavailabilityRequest(
  @NotNull(message = "O ID do médico é obrigatório")
  Long doctorId,

  @NotNull(message = "Data de início é obrigatória")
  @FutureOrPresent(message = "A data de início deve ser presente ou futura")
  LocalDateTime startDateTime,

  @NotNull(message = "Data de fim é obrigatória")
  @FutureOrPresent(message = "A data de fim deve ser presente ou futura")
  LocalDateTime endDateTime,

  String reason
) {
  public DoctorUnavailabilityRequest {
    if (startDateTime != null && endDateTime != null && startDateTime.isAfter(endDateTime)) {
      throw new IllegalArgumentException("A data de início não pode ser posterior à data de fim.");
    }
  }
}