package com.hms.profile.dto.request;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DoctorUpdateRequest(
  String name,

  @Past(message = "A data de nascimento deve ser no passado.")
  LocalDate dateOfBirth,

  String specialization,

  String department,

  String phoneNumber,

  @PositiveOrZero(message = "Os anos de experiência não podem ser negativos.")
  Integer yearsOfExperience,

  String qualifications,

  String biography,

  BigDecimal consultationFee
) {
}