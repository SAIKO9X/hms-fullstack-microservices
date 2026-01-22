package com.hms.appointment.dto.request;

import com.hms.appointment.enums.AppointmentType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AppointmentCreateRequest(
  @NotNull(message = "O ID do doutor é obrigatório.")
  Long doctorId,

  @NotNull(message = "A data e hora do agendamento são obrigatórias.")
  @Future(message = "A data do agendamento deve ser no futuro.")
  LocalDateTime appointmentDateTime,

  @Min(value = 15, message = "A duração mínima é de 15 minutos.")
  Integer duration,

  @NotBlank(message = "O motivo da consulta é obrigatório.")
  String reason,

  AppointmentType type
) {
}