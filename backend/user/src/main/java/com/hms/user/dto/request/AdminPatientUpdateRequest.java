package com.hms.user.dto.request;

public record AdminPatientUpdateRequest(
  String name,
  String cpf,
  String phoneNumber,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  String bloodGroup,
  String gender,
  String chronicDiseases,
  String allergies
) {
}