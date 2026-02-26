package com.hms.appointment.dto.event;

public record LabOrderCompletedEvent(
  Long labOrderId,
  String labOrderNumber,
  Long appointmentId,
  Long patientId,
  String patientName,
  Long doctorId,
  Long doctorUserId,
  Long patientUserId,
  String doctorName,
  String doctorEmail,
  String completionDate,
  String resultUrl
) {
}