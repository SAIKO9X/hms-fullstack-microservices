package com.hms.appointment.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PrescriptionUpdateRequest(
  String notes,
  @NotEmpty List<MedicineRequest> medicines
) {
}