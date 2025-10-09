package com.hms.appointment.response;

import com.hms.appointment.enums.AppointmentStatus;

import java.util.Map;

public record DoctorDashboardStatsResponse(
  long appointmentsTodayCount,
  long completedThisWeekCount,
  Map<AppointmentStatus, Long> statusDistribution
) {
}