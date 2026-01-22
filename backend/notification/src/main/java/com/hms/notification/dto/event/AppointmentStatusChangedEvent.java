package com.hms.notification.dto.event;

import java.io.Serializable;
import java.time.LocalDateTime;

public record AppointmentStatusChangedEvent(
  Long appointmentId,
  Long patientId,
  String patientEmail,
  String patientName,
  String doctorName,
  LocalDateTime appointmentDateTime,
  String newStatus,
  String reasonOrNotes
) implements Serializable {
}