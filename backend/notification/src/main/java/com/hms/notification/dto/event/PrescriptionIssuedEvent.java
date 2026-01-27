package com.hms.notification.dto.event;

public record PrescriptionIssuedEvent(
  Long patientId,
  String patientName,
  String patientEmail,
  String doctorName,
  Long prescriptionId
) {
}