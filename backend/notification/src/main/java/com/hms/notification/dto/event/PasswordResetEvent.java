package com.hms.notification.dto.event;

public record PasswordResetEvent(
  String email,
  String userName,
  String resetLink,
  int expirationMinutes
) {
}