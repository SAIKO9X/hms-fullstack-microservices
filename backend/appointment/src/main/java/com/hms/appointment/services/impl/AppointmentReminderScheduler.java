package com.hms.appointment.services.impl;

import com.hms.appointment.dto.event.AppointmentEvent;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentReminderScheduler {

  private final AppointmentRepository appointmentRepository;
  private final PatientReadModelRepository patientRepository;
  private final DoctorReadModelRepository doctorRepository;
  private final RabbitTemplate rabbitTemplate;

  // Roda a cada 5 minutos
  @Scheduled(fixedRate = 300000)
  @Transactional
  public void checkUpcomingAppointments() {
    LocalDateTime now = LocalDateTime.now();

    // processa Lembretes de 24 horas (janela: daqui a 23h55m até 24h05m)
    LocalDateTime windowStart24h = now.plusHours(24).minusMinutes(5);
    LocalDateTime windowEnd24h = now.plusHours(24).plusMinutes(5);

    List<Appointment> appointments24h = appointmentRepository.findByStatusAndReminder24hSentFalseAndAppointmentDateTimeBetween(
      AppointmentStatus.SCHEDULED, windowStart24h, windowEnd24h
    );

    for (Appointment app : appointments24h) {
      sendReminder(app, "24H_REMINDER");
      app.setReminder24hSent(true);
    }
    if (!appointments24h.isEmpty()) {
      appointmentRepository.saveAll(appointments24h);
      log.info("Processados {} lembretes de 24h.", appointments24h.size());
    }

    // processa lembretes de 1 hora (janela: daqui a 55m até 1h05m)
    LocalDateTime windowStart1h = now.plusHours(1).minusMinutes(5);
    LocalDateTime windowEnd1h = now.plusHours(1).plusMinutes(5);

    List<Appointment> appointments1h = appointmentRepository.findByStatusAndReminder1hSentFalseAndAppointmentDateTimeBetween(
      AppointmentStatus.SCHEDULED, windowStart1h, windowEnd1h
    );

    for (Appointment app : appointments1h) {
      sendReminder(app, "1H_REMINDER");
      app.setReminder1hSent(true);
    }
    if (!appointments1h.isEmpty()) {
      appointmentRepository.saveAll(appointments1h);
      log.info("Processados {} lembretes de 1h.", appointments1h.size());
    }
  }

  private void sendReminder(Appointment app, String type) {
    try {
      PatientReadModel patient = patientRepository.findById(app.getPatientId()).orElse(null);
      DoctorReadModel doctor = doctorRepository.findById(app.getDoctorId()).orElse(null);

      if (patient == null || doctor == null) return;

      AppointmentEvent event = new AppointmentEvent(
        app.getId(),
        app.getPatientId(),
        patient.getEmail(),
        doctor.getFullName(),
        app.getAppointmentDateTime(),
        null
      );

      // routing key diferencia: "appointment.reminder.24h" ou "appointment.reminder.1h"
      String routingKey = type.equals("24H_REMINDER") ? "appointment.reminder.24h" : "appointment.reminder.1h";

      rabbitTemplate.convertAndSend("internal.exchange", routingKey, event);
    } catch (Exception e) {
      log.error("Erro ao enviar lembrete para consulta {}", app.getId(), e);
    }
  }
}