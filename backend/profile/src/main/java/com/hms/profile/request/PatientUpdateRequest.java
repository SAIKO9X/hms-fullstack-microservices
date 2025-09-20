package com.hms.profile.request;

import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientUpdateRequest(
  @NotNull(message = "O gênero não pode ser nulo.")
  Gender gender,

  @Past(message = "A data de nascimento deve ser no passado.")
  @NotNull(message = "A data de nascimento não pode ser nula.")
  LocalDate dateOfBirth,

  @NotBlank(message = "O número de telefone é obrigatório.")
  @Size(min = 10, max = 15, message = "O número de telefone deve ter entre 10 e 15 caracteres.")
  String phoneNumber,

  @NotNull(message = "O tipo sanguíneo não pode ser nulo.")
  BloodGroup bloodGroup,

  @NotBlank(message = "O endereço é obrigatório.")
  String address,

  @NotBlank(message = "O nome do contato de emergência é obrigatório.")
  String emergencyContactName,

  @NotBlank(message = "O telefone do contato de emergência é obrigatório.")
  String emergencyContactPhone,

  String allergies,

  String chronicDiseases
) {
}