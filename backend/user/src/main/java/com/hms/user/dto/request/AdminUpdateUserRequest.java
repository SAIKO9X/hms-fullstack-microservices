package com.hms.user.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record AdminUpdateUserRequest(
  @Email(message = "Email inválido")
  String email,

  @Size(min = 3, message = "O nome deve ter pelo menos 3 caracteres")
  String name,

  @Pattern(regexp = "^$|^[\\s()0-9-]{8,}$", message = "Número de telefone inválido")
  String phoneNumber,

  @Past(message = "Data de nascimento deve ser no passado")
  LocalDate dateOfBirth,

  // Campos de Paciente
  @Pattern(regexp = "^$|^\\d{11}$", message = "CPF deve conter 11 dígitos")
  String cpf,

  @Size(min = 5, message = "Endereço parece curto demais")
  String address,

  String emergencyContactName,
  String emergencyContactPhone,
  String bloodGroup,
  String gender,
  String chronicDiseases,
  String allergies,

  // Campos de Médico
  @Pattern(regexp = "^$|^\\d{4,10}$", message = "CRM deve conter de 4 a 10 dígitos")
  String crmNumber,

  String specialization,
  String department,
  String biography,
  String qualifications,

  @Min(value = 0, message = "Anos de experiência não podem ser negativos")
  Integer yearsOfExperience
) {
}