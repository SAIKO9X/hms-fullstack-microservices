package com.hms.appointment.response;

import com.hms.appointment.enums.AppointmentStatus;

import java.time.LocalDateTime;

public record AppointmentDetailResponse(
  Long id,
  Long patientId,
  String patientName,
  String patientPhoneNumber,
  Long doctorId,
  String doctorName,
  LocalDateTime appointmentDateTime,
  String reason,
  AppointmentStatus status
) {
}