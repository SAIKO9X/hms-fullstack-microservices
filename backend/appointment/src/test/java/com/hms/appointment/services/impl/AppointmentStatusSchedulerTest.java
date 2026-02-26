package com.hms.appointment.services.impl;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentStatusSchedulerTest {

  @InjectMocks
  private AppointmentStatusScheduler scheduler;

  @Mock
  private AppointmentRepository appointmentRepository;

  @Captor
  private ArgumentCaptor<List<Appointment>> appointmentListCaptor;

  @Test
  @DisplayName("Deve atualizar consultas antigas para NO_SHOW e adicionar nota")
  void markMissedAppointments_WithPendingAppointments_ShouldUpdateToNoShow() {
    Appointment appointment1 = new Appointment();
    appointment1.setId(1L);
    appointment1.setStatus(AppointmentStatus.SCHEDULED);
    appointment1.setNotes("Nota original.");

    Appointment appointment2 = new Appointment();
    appointment2.setId(2L);
    appointment2.setStatus(AppointmentStatus.SCHEDULED);

    List<Appointment> pendingAppointments = List.of(appointment1, appointment2);

    // usa any() para o tempo, pois o scheduler chama LocalDateTime.now() internamente
    when(appointmentRepository.findByStatusAndAppointmentDateTimeBefore(
      eq(AppointmentStatus.SCHEDULED), any(LocalDateTime.class)))
      .thenReturn(pendingAppointments);

    scheduler.markMissedAppointments();

    verify(appointmentRepository, times(1)).saveAll(appointmentListCaptor.capture());

    List<Appointment> savedAppointments = appointmentListCaptor.getValue();
    assertEquals(2, savedAppointments.size());

    // verifica o primeiro
    assertEquals(AppointmentStatus.NO_SHOW, savedAppointments.get(0).getStatus());
    assertTrue(savedAppointments.get(0).getNotes().contains("Nota original."));
    assertTrue(savedAppointments.get(0).getNotes().contains("[Sistema: Marcado automaticamente"));

    // verifica o segundo
    assertEquals(AppointmentStatus.NO_SHOW, savedAppointments.get(1).getStatus());
    assertTrue(savedAppointments.get(1).getNotes().contains("[Sistema: Marcado automaticamente"));
  }

  @Test
  @DisplayName("Não deve interagir com o banco de dados se não houver consultas pendentes")
  void markMissedAppointments_WithNoPendingAppointments_ShouldDoNothing() {
    when(appointmentRepository.findByStatusAndAppointmentDateTimeBefore(
      eq(AppointmentStatus.SCHEDULED), any(LocalDateTime.class)))
      .thenReturn(Collections.emptyList());

    // Act
    scheduler.markMissedAppointments();

    // garante que o saveAll nunca foi chamado
    verify(appointmentRepository, never()).saveAll(any());
  }
}