package com.hms.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MedicalDocumentCreateRequest(
  @NotNull(message = "O ID do paciente é obrigatório.")
  Long patientId,

  @NotNull(message = "O ID da consulta é obrigatório.")
  Long appointmentId,

  @NotBlank(message = "O nome do documento é obrigatório.")
  String documentName,

  @NotBlank(message = "O tipo do documento é obrigatório.")
  String documentType,

  @NotBlank(message = "A URL do ficheiro é obrigatória.")
  String mediaUrl
) {
}