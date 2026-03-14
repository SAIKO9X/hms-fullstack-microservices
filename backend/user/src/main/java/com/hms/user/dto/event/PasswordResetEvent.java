package com.hms.user.dto.event;

public record PasswordResetEvent(
  String email,
  String userName,
  String resetLink,
  int expirationMinutes
) {
}