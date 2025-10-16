package com.hms.profile.dto.request;

import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;

import java.time.LocalDate;

public record AdminPatientUpdateRequest(
  String name,
  String cpf,
  String phoneNumber,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  BloodGroup bloodGroup,
  Gender gender,
  LocalDate dateOfBirth,
  String chronicDiseases,
  String allergies
) {
}