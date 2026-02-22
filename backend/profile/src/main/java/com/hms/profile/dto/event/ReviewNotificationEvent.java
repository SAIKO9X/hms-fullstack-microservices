package com.hms.profile.dto.event;

public record ReviewNotificationEvent(
  String doctorId,
  String patientName,
  Integer rating,
  String comment
) {
}