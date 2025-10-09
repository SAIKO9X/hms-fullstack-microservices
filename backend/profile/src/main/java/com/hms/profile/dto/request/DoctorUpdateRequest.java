package com.hms.profile.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record DoctorUpdateRequest(
  @NotBlank(message = "O nome não pode ser vazio.")
  String name,

  @NotNull(message = "A data de nascimento não pode ser nula.")
  @Past(message = "A data de nascimento deve ser no passado.")
  LocalDate dateOfBirth,

  @NotBlank(message = "A especialização é obrigatória.")
  String specialization,

  @NotBlank(message = "O departamento é obrigatório.")
  String department,

  @NotBlank(message = "O número de telefone é obrigatório.")
  String phoneNumber,

  @NotNull(message = "Os anos de experiência são obrigatórios.")
  @PositiveOrZero(message = "Os anos de experiência não podem ser negativos.")
  Integer yearsOfExperience,

  String qualifications,

  String biography
) {
}