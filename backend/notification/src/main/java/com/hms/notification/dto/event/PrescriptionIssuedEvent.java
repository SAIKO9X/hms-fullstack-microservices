package com.hms.notification.dto.event;

public record PrescriptionIssuedEvent(
  Long patientId,
  Long patientUserId,
  String patientName,
  String patientEmail,
  String doctorName,
  Long prescriptionId
) {
}