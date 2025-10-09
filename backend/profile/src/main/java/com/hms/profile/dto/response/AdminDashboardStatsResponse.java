package com.hms.profile.dto.response;

public record AdminDashboardStatsResponse(
  long totalPatients,
  long totalDoctors
) {
}