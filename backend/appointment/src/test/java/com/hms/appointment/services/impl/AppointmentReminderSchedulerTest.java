package com.hms.appointment.services.impl;

import com.hms.appointment.clients.UserFeignClient;
import com.hms.appointment.dto.external.UserResponse;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.common.dto.event.EventEnvelope;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentReminderSchedulerTest {

  @InjectMocks
  private AppointmentReminderScheduler scheduler;

  @Mock
  private AppointmentRepository appointmentRepository;
  @Mock
  private PatientReadModelRepository patientRepository;
  @Mock
  private DoctorReadModelRepository doctorRepository;
  @Mock
  private RabbitTemplate rabbitTemplate;
  @Mock
  private UserFeignClient userFeignClient;

  @Test
  @DisplayName("Deve enviar evento RabbitMQ para lembretes de 24h e atualizar a flag no banco")
  void checkUpcomingAppointments_With24hReminders_ShouldSendEventAndSave() {
    Appointment app24h = new Appointment();
    app24h.setId(10L);
    app24h.setPatientId(1L);
    app24h.setDoctorId(1L);
    app24h.setAppointmentDateTime(LocalDateTime.now().plusHours(24));
    app24h.setReminder24hSent(false);

    PatientReadModel patient = new PatientReadModel();
    patient.setPatientId(1L);
    patient.setUserId(1L);
    patient.setFullName("John Doe");

    DoctorReadModel doctor = new DoctorReadModel();
    doctor.setDoctorId(1L);
    doctor.setFullName("Dr. Smith");

    UserResponse userResponse = new UserResponse(1L, "John Doe", "john@example.com", "PATIENT");

    // simula que encontra para 24h, mas não encontra para 1h
    when(appointmentRepository.findByStatusAndReminder24hSentFalseAndAppointmentDateTimeBetween(
      eq(AppointmentStatus.SCHEDULED), any(), any()))
      .thenReturn(List.of(app24h));

    when(appointmentRepository.findByStatusAndReminder1hSentFalseAndAppointmentDateTimeBetween(
      eq(AppointmentStatus.SCHEDULED), any(), any()))
      .thenReturn(Collections.emptyList());

    when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
    when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
    when(userFeignClient.getUserById(1L)).thenReturn(userResponse);

    scheduler.checkUpcomingAppointments();

    // verifica se a mensagem foi enviada para o RabbitMQ com a Routing Key correta
    verify(rabbitTemplate, times(1)).convertAndSend(
      eq("internal.exchange"),
      eq("appointment.reminder.24h"),
      any(EventEnvelope.class)
    );

    // verifica se atualizou a flag e salvou
    assertTrue(app24h.isReminder24hSent());
    verify(appointmentRepository, times(1)).saveAll(anyList());
  }

  @Test
  @DisplayName("Não deve enviar lembrete se o paciente ou médico não forem encontrados na ReadModel")
  void checkUpcomingAppointments_MissingPatientOrDoctor_ShouldNotSendEvent() {
    Appointment app = new Appointment();
    app.setId(20L);
    app.setPatientId(99L);
    app.setDoctorId(99L);

    when(appointmentRepository.findByStatusAndReminder24hSentFalseAndAppointmentDateTimeBetween(
      any(), any(), any())).thenReturn(List.of(app));
    when(appointmentRepository.findByStatusAndReminder1hSentFalseAndAppointmentDateTimeBetween(
      any(), any(), any())).thenReturn(Collections.emptyList());

    // simula paciente não encontrado usando 99L
    when(patientRepository.findById(99L)).thenReturn(Optional.empty());

    scheduler.checkUpcomingAppointments();

    // garante que o RabbitMQ não foi chamado
    verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(EventEnvelope.class));
  }
}