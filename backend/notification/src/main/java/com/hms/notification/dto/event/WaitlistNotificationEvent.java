package com.hms.notification.dto.event;

import java.time.LocalDateTime;

public record WaitlistNotificationEvent(
  String email,
  String patientName,
  String doctorName,
  LocalDateTime availableDateTime
) {
}