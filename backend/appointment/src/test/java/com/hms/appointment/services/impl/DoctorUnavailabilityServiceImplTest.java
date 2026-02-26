package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.dto.request.DoctorUnavailabilityRequest;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.DoctorUnavailabilityRepository;
import com.hms.common.exceptions.InvalidOperationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorUnavailabilityServiceImplTest {

  @Mock
  private DoctorUnavailabilityRepository repository;

  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private DoctorReadModelRepository doctorReadModelRepository;

  @Mock
  private ProfileFeignClient profileFeignClient;

  @InjectMocks
  private DoctorUnavailabilityServiceImpl doctorUnavailabilityService;

  @Test
  @DisplayName("Deve lançar exceção ao tentar bloquear agenda com uma consulta já existente no mesmo horário")
  void createUnavailability_WithExistingAppointment_ShouldThrowException() {
    Long doctorId = 1L;
    LocalDateTime start = LocalDateTime.now().plusDays(1).withHour(10);
    LocalDateTime end = LocalDateTime.now().plusDays(1).withHour(12);

    DoctorUnavailabilityRequest request = new DoctorUnavailabilityRequest(
      doctorId, start, end, "Congresso Médico"
    );

    DoctorReadModel mockDoctor = new DoctorReadModel();
    mockDoctor.setDoctorId(doctorId);

    when(doctorReadModelRepository.findByUserId(doctorId)).thenReturn(Optional.of(mockDoctor));
    when(repository.hasUnavailability(anyLong(), any(), any())).thenReturn(false);

    // força cenário de conflito para validar a proteção de consistência da agenda
    when(appointmentRepository.hasDoctorConflict(doctorId, start, end)).thenReturn(true);

    InvalidOperationException exception = assertThrows(InvalidOperationException.class, () -> {
      doctorUnavailabilityService.createUnavailability(request);
    });

    assertEquals("Não é possível bloquear a agenda: Existem consultas agendadas neste período.", exception.getMessage());

    // garante que a transação seja abortada sem persistência indevida de dados concorrentes
    verify(repository, never()).save(any());
  }
}