package com.hms.appointment.dto.response;

public record AppointmentStatsResponse(
  long total,
  long scheduled,
  long completed,
  long canceled
) {
}