package com.hms.appointment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AppointmentRecordCreateRequest(
  @NotNull(message = "ID da consulta é obrigatório")
  Long appointmentId,

  @NotBlank(message = "Queixa principal é obrigatória")
  String chiefComplaint,

  String historyOfPresentIllness,
  String physicalExamNotes,

  List<String> symptoms,

  String diagnosisCid10,

  @NotBlank(message = "Descrição do diagnóstico é obrigatória")
  String diagnosisDescription,

  String treatmentPlan,

  List<String> requestedTests,
  String notes
) {
}