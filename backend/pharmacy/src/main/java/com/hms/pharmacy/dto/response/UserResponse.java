package com.hms.pharmacy.dto.response;

public record UserResponse(
  Long id,
  String name,
  String email,
  String role,
  boolean active
) {
}