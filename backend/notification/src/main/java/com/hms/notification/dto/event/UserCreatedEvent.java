package com.hms.notification.dto.event;

public record UserCreatedEvent(
  String name,
  String email,
  String verificationCode
) {
}