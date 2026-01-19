package com.hms.appointment.dto.response;

import java.time.LocalDateTime;

public record DoctorPatientSummaryDto(
  Long patientId,
  Long userId,
  String patientName,
  String patientEmail,
  Long totalAppointments,
  LocalDateTime lastAppointmentDate,
  String status,
  String profilePicture
) {
}