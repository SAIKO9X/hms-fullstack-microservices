package com.hms.profile.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DoctorCreateRequest(
  @NotNull(message = "O ID do usuário é obrigatório.")
  Long userId,

  @NotBlank(message = "O número do CRM é obrigatório.")
  String crmNumber,

  @NotBlank(message = "O nome do doutor é obrigatório.")
  String name
) {
}