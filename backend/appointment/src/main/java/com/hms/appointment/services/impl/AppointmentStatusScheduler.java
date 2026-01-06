package com.hms.appointment.services.impl;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentStatusScheduler {

  private final AppointmentRepository appointmentRepository;

  // Executa a cada 30 minutos.
  // Cron expression: Segundo Minuto Hora Dia Mês DiaDaSemana
  @Scheduled(cron = "0 0/30 * * * *")
  @Transactional
  public void markMissedAppointments() {
    log.info("Iniciando verificação de consultas não realizadas...");

    LocalDateTime toleranceTime = LocalDateTime.now().minusHours(1);

    // Busca consultas que ainda estão AGENDADAS e são anteriores ao tempo de tolerância
    List<Appointment> missedAppointments = appointmentRepository.findByStatusAndAppointmentDateTimeBefore(
      AppointmentStatus.SCHEDULED,
      toleranceTime
    );

    if (missedAppointments.isEmpty()) {
      log.info("Nenhuma consulta pendente encontrada.");
      return;
    }

    // Atualiza para NO_SHOW "não compareceu"
    for (Appointment appointment : missedAppointments) {
      appointment.setStatus(AppointmentStatus.NO_SHOW);

      String currentNotes = appointment.getNotes() != null ? appointment.getNotes() : "";
      appointment.setNotes(currentNotes + " [Sistema: Marcado automaticamente como Não Compareceu por ausência de ação]");
    }

    appointmentRepository.saveAll(missedAppointments);
    log.info("{} consultas foram atualizadas para NO_SHOW.", missedAppointments.size());
  }
}