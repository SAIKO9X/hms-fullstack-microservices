package com.hms.appointment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdverseEffectReportCreateRequest(
  @NotNull(message = "O ID do médico é obrigatório.")
  Long doctorId,

  @NotNull(message = "O ID da prescrição é obrigatório.")
  Long prescriptionId,

  @NotBlank(message = "A descrição do efeito adverso é obrigatória.")
  String description
) {}