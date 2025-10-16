package com.hms.profile.dto.request;

import java.time.LocalDate;

public record AdminDoctorUpdateRequest(
  String name,
  String crmNumber,
  String specialization,
  String department,
  String phoneNumber,
  String biography,
  String qualifications,
  LocalDate dateOfBirth
) {
}