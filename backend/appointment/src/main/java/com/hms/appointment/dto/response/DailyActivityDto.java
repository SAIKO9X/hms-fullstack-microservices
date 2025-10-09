package com.hms.appointment.dto.response;

import java.time.LocalDate;

public record DailyActivityDto(
  LocalDate date,
  long newPatients,
  long appointments
) {
}