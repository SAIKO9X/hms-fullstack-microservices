package com.hms.notification.dto.event;

import java.time.LocalDateTime;

public record AppointmentStatusChangedEvent(
  Long appointmentId,
  String oldStatus,
  String newStatus,
  Long patientId,
  String patientEmail,
  String patientName,
  Long doctorId,
  String doctorEmail,
  String doctorName,
  LocalDateTime appointmentDateTime,
  boolean triggeredByPatient
) {
}