package com.hms.appointment.dto.event;

import java.io.Serializable;
import java.time.LocalDateTime;

public record AppointmentStatusChangedEvent(
  Long appointmentId,
  Long patientId,
  Long doctorId,
  String patientEmail,
  String patientName,
  String doctorName,
  LocalDateTime appointmentDate,
  String status, // SCHEDULED, CANCELED, RESCHEDULED
  String reasonOrNotes
) implements Serializable {
}