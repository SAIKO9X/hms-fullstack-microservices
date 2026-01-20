package com.hms.appointment.dto.external;

public record UserResponse(
  Long id,
  String name,
  String email,
  String role
) {
}