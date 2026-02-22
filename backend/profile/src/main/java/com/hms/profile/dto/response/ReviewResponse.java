package com.hms.profile.dto.response;

import java.time.LocalDateTime;

public record ReviewResponse(
  Long id,
  Long appointmentId,
  Integer rating,
  String comment,
  LocalDateTime createdAt,
  String patientName,
  String patientPhotoUrl
) {
}