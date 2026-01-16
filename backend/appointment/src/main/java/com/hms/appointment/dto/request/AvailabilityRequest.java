package com.hms.appointment.dto.request;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record AvailabilityRequest(
  DayOfWeek dayOfWeek,
  LocalTime startTime,
  LocalTime endTime
) {
}