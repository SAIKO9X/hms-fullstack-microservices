package com.hms.profile.dto.event;

import java.io.Serializable;
import java.time.LocalDate;

public record UserUpdatedEvent(
  Long userId,
  String name,
  String email,
  String role,

  // Campos Comuns
  String phone,
  LocalDate dateOfBirth,

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
  String crm,
  String specialization,
  String department,
  String biography,
  String qualifications,
  Integer yearsOfExperience
) implements Serializable {
}