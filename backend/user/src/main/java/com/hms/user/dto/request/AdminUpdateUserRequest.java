package com.hms.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
  @Email(message = "Email inválido")
  String email,
  @Size(min = 3, message = "O nome deve ter pelo menos 3 caracteres")
  String name,
  @Pattern(regexp = "^$|^[\\s()0-9-]{8,}$", message = "Número de telefone inválido")
  String phoneNumber,

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
  String qualifications
) {
}