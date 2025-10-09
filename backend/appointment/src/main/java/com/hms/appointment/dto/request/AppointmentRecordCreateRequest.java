package com.hms.appointment.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AppointmentRecordCreateRequest(
  @NotNull Long appointmentId,
  List<String> symptoms,
  String diagnosis,
  List<String> tests,
  String notes,
  List<String> prescription
) {
}