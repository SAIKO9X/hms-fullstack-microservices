package com.hms.appointment.dto.response;

import java.time.LocalDateTime;

public record DoctorUnavailabilityResponse(
  Long id,
  Long doctorId,
  LocalDateTime startDateTime,
  LocalDateTime endDateTime,
  String reason
) {
}