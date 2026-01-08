package com.hms.user.dto.event;

import com.hms.user.enums.UserRole;

public record UserCreatedEvent(
  Long userId,
  String name,
  String email,
  UserRole role,
  String cpf,      // Para Paciente
  String crm       // Para Médico
) {
}