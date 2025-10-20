package com.hms.user.dto.request;

import com.hms.user.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCreateUserRequest {

  @NotBlank(message = "O nome é obrigatório")
  private String name;

  @NotBlank(message = "O email é obrigatório")
  @Email(message = "Email inválido")
  private String email;

  @NotBlank(message = "A senha é obrigatória")
  @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
  private String password;

  @NotNull(message = "O tipo de utilizador é obrigatório")
  private UserRole role;

  @Pattern(regexp = "^$|^\\d{11}$", message = "CPF deve conter 11 dígitos (ou estar vazio se não for paciente)")
  private String cpf; // A lógica de ser obrigatório ou não está no schema do frontend (Zod)

  @Pattern(regexp = "^$|^\\d{4,10}$", message = "CRM deve conter de 4 a 10 dígitos (ou estar vazio se não for médico)")
  private String crmNumber;

  private String specialization;
}