package com.hms.appointment.dto.external;

public record PatientProfile(
  Long id,
  Long userId,
  String name,
  String phoneNumber
) {
}