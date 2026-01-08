package com.hms.profile.dto.event;

public record UserCreatedEvent(
  Long userId,
  String name,
  String email,
  String role,
  String cpf,      // Para Paciente
  String crm       // Para Médico
) {
}