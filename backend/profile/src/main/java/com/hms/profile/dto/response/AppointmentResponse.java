package com.hms.profile.dto.response;

import com.hms.profile.enums.AppointmentStatus;

import java.time.LocalDateTime;

public record AppointmentResponse(
  Long id,
  Long patientId,
  Long doctorId,
  LocalDateTime appointmentDateTime,
  String reason,
  AppointmentStatus status,
  String notes
) {
}