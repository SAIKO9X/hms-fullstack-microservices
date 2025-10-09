package com.hms.profile.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PatientCreateRequest(
  @NotNull(message = "O ID do usuário é obrigatório para criar um perfil.")
  Long userId,

  @NotBlank(message = "O CPF é obrigatório.")
  String cpf,

  @NotBlank(message = "O nome do doutor é obrigatório.")
  String name
) {
}