package com.hms.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetPasswordRequest(
  @NotBlank(message = "O token é obrigatório")
  String token,

  @NotBlank(message = "A nova senha é obrigatória")
  @Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$",
    message = "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número."
  )
  String newPassword
) {
}