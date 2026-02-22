package com.hms.notification.dto.event;

public record ReviewNotificationEvent(
  String doctorId,
  String patientName,
  Integer rating,
  String comment
) {
}