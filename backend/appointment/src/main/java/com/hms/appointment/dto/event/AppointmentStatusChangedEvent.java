package com.hms.appointment.dto.event;

import java.io.Serializable;
import java.time.LocalDateTime;

public record AppointmentStatusChangedEvent(
  Long appointmentId,
  Long patientId,
  Long patientUserId,
  Long doctorId,
  Long doctorUserId,
  String patientEmail,
  String patientName,
  String doctorName,
  LocalDateTime appointmentDateTime,
  String newStatus,
  String notes,
  boolean triggeredByPatient
) implements Serializable {
}