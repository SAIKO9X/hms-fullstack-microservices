package com.hms.profile.dto.request;

import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientUpdateRequest(
  String name,

  Gender gender,

  @Past(message = "A data de nascimento deve ser no passado.")
  LocalDate dateOfBirth,

  @Size(min = 10, max = 15, message = "O número de telefone deve ter entre 10 e 15 caracteres.")
  String phoneNumber,

  BloodGroup bloodGroup,

  String address,

  String emergencyContactName,

  String emergencyContactPhone,

  String allergies,

  String chronicDiseases
) {
}