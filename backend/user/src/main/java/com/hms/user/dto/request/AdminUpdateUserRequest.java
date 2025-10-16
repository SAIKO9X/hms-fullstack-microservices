package com.hms.user.dto.request;

public record AdminUpdateUserRequest(
  String email,
  String name,
  String phoneNumber,

  // Campos de Paciente
  String cpf,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  String bloodGroup,
  String gender,
  String chronicDiseases,
  String allergies,

  // Campos de Médico
  String crmNumber,
  String specialization,
  String department,
  String biography,
  String qualifications
) {
}