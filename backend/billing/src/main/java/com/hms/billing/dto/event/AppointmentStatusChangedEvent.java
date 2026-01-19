package com.hms.billing.dto.event;

public record AppointmentStatusChangedEvent(
  Long appointmentId,
  String patientId, // ID do paciente no Profile Service
  String doctorId,
  String status, // COMPLETED, CANCELLED, etc.
  String appointmentDate
) {
}