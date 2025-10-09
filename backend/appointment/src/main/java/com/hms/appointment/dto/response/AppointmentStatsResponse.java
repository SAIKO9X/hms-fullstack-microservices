package com.hms.appointment.response;

public record AppointmentStatsResponse(
  long total,
  long scheduled,
  long completed,
  long canceled
) {
}