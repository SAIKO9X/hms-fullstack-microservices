package com.hms.appointment.dto.request;

import java.util.List;

public record AppointmentRecordUpdateRequest(
  List<String> symptoms,
  String diagnosis,
  List<String> tests,
  String notes,
  List<String> prescription
) {
}