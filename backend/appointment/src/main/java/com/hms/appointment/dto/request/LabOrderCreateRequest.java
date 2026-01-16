package com.hms.appointment.dto.request;

import java.util.List;

public record LabOrderCreateRequest(
  Long appointmentId,
  Long patientId,
  String notes,
  List<LabTestItemRequest> tests
) {
}
