package com.hms.appointment.dto.request;

import com.hms.appointment.enums.AppointmentStatus;
import java.time.LocalDateTime;

// Sem anotações de validação, pois todos os campos são opcionais para um PATCH
public record AppointmentUpdateRequest(
  LocalDateTime appointmentDateTime, // Para reagendamento
  AppointmentStatus status,          // Para cancelar ou concluir
  String notes                       // Para o doutor adicionar anotações
) {}