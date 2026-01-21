package com.hms.profile.dto.request;

import java.time.LocalDate;
import java.util.List;

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
  String chronicConditions,
  String familyHistory,
  List<String> allergies
) {
}