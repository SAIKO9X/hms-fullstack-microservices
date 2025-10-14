package com.hms.profile.dto.response;

import java.time.LocalDateTime;

public record AppointmentHistoryDto(
  Long id,
  LocalDateTime appointmentDateTime,
  String reason,
  String status,
  String doctorName
) {
}