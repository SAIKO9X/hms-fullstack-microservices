package com.hms.profile.dto.response;

public record DoctorStatusResponse(
  Long id,
  String name,
  String specialization,
  String status,
  String profilePictureUrl
) {
}