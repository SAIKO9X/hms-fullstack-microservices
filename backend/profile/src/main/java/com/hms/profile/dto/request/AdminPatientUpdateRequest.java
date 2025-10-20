package com.hms.profile.dto.request;

import java.time.LocalDate;

public record AdminPatientUpdateRequest(
  String name,
  String cpf,
  String phoneNumber,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  String bloodGroup,
  String gender,
  LocalDate dateOfBirth,
  String chronicDiseases,
  String allergies
) {
}