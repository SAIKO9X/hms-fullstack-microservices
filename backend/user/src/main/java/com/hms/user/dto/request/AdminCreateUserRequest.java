package com.hms.user.dto.request;

import com.hms.user.enums.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateUserRequest {
  // User data
  private String name;
  private String email;
  private String password;
  private UserRole role;

  // Profile data
  private String cpf; // Paciente
  private String crmNumber; // Doutor
  private String specialization; // Doutor
}