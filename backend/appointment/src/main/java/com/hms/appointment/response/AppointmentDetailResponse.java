package com.hms.appointment.response;

import com.hms.appointment.enums.AppointmentStatus;
import java.time.LocalDateTime;

public record AppointmentDetailResponse(
  Long id,
  Long patientId,
  String patientName, // <-- Dado agregado
  Long doctorId,
  String doctorName,   // <-- Dado agregado
  LocalDateTime appointmentDateTime,
  AppointmentStatus status
) {}