package com.hms.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
  @Email(message = "Email inválido")
  @NotBlank(message = "O email é obrigatório")
  String email
) {
}