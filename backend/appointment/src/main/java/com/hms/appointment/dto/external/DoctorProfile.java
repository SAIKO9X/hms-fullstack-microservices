package com.hms.appointment.dto.external;

public record DoctorProfile(
  Long id,
  Long userId,
  String name,
  String specialization,
  String email
) {
}