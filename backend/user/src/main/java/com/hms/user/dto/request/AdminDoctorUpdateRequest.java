package com.hms.user.dto.request;

public record AdminDoctorUpdateRequest(
  String name,
  String crmNumber,
  String specialization,
  String department,
  String phoneNumber,
  String biography,
  String qualifications
) {
}