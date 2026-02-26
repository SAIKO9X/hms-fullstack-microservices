package com.hms.profile.services.impl;

import com.hms.common.dto.response.ApiResponse;
import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.response.AppointmentResponse;
import com.hms.profile.dto.response.MedicalHistoryResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.entities.Patient;
import com.hms.profile.enums.AppointmentStatus;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.repositories.PatientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicalHistoryServiceImplTest {

  @Mock
  private AppointmentFeignClient appointmentFeignClient;

  @Mock
  private DoctorRepository doctorRepository;

  @Mock
  private PatientRepository patientRepository;

  @InjectMocks
  private MedicalHistoryServiceImpl medicalHistoryService;

  @Test
  @DisplayName("Deve agregar histórico de consultas do Feign com os nomes dos médicos do DB local (API Composition)")
  void getPatientMedicalHistory_ShouldAggregateData_WhenSuccessful() {
    Long patientId = 1L;
    Long doctorId = 100L;

    when(patientRepository.findById(patientId)).thenReturn(Optional.of(new Patient()));

    AppointmentResponse appointmentMock = new AppointmentResponse(
      10L, patientId, doctorId, LocalDateTime.now(), "Rotina", AppointmentStatus.COMPLETED, "Sem observações"
    );

    when(appointmentFeignClient.getAppointmentHistoryForPatient(patientId))
      .thenReturn(ApiResponse.success(List.of(appointmentMock)));

    Doctor doctorMock = new Doctor();
    doctorMock.setId(doctorId);
    doctorMock.setName("Dr. House");

    when(doctorRepository.findAllById(List.of(doctorId))).thenReturn(List.of(doctorMock));

    MedicalHistoryResponse result = medicalHistoryService.getPatientMedicalHistory(patientId);

    assertEquals(1, result.appointments().size());
    assertEquals("Dr. House", result.appointments().get(0).doctorName());
    assertEquals("Rotina", result.appointments().get(0).reason());
  }

  @Test
  @DisplayName("Deve garantir o funcionamento do Fallback do Circuit Breaker retornando lista vazia")
  void fetchHistoryFallback_ShouldReturnEmptyList_OnException() {
    MedicalHistoryResponse result = medicalHistoryService.fetchHistoryFallback(1L, new RuntimeException("Appointment Service Down"));

    assertEquals(0, result.appointments().size(), "O fallback deve absorver a falha e retornar um histórico vazio de forma segura");
  }
}