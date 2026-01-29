package com.hms.appointment.dto.request;

import jakarta.validation.constraints.NotNull;

public record AppointmentCompleteRequest(
  @NotNull(message = "Notes are required to complete an appointment")
  String notes
) {
}