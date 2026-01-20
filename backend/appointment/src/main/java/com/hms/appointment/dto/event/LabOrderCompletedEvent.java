package com.hms.appointment.dto.event;

public record LabOrderCompletedEvent(
  Long labOrderId,
  String labOrderNumber,
  Long appointmentId,
  Long patientId,
  String patientName,
  Long doctorId,
  Long doctorUserId,
  String doctorName,
  String doctorEmail,
  String completionDate,
  String resultUrl
) {
}