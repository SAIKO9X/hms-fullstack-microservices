package com.hms.appointment.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.appointment.BaseIntegrationTest;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.enums.AppointmentType;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.common.security.HmsUserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class AppointmentIntegrationTest extends BaseIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private AppointmentRepository appointmentRepository;

  @Autowired
  private DoctorReadModelRepository doctorRepository;

  @Autowired
  private PatientReadModelRepository patientRepository;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    appointmentRepository.deleteAll();
    doctorRepository.deleteAll();
    patientRepository.deleteAll();
  }

  @Test
  @DisplayName("Deve criar um agendamento com sucesso no banco real (Testcontainers)")
  void shouldCreateAppointmentSuccessfully() throws Exception {
    // prepara dados no banco do container
    PatientReadModel patient = new PatientReadModel();
    patient.setPatientId(1L);
    patient.setUserId(100L);
    patient.setFullName("Paciente Teste Integração");
    patient.setEmail("paciente@teste.com");
    patientRepository.save(patient);

    DoctorReadModel doctor = new DoctorReadModel();
    doctor.setDoctorId(2L);
    doctor.setUserId(200L);
    doctor.setFullName("Dr. Teste Integração");
    doctorRepository.save(doctor);

    LocalDateTime dataValida = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0);
    AppointmentCreateRequest request = new AppointmentCreateRequest(
      2L,
      dataValida,
      60,
      "Checkup de Rotina",
      AppointmentType.IN_PERSON
    );

    HmsUserPrincipal principal = HmsUserPrincipal.builder()
      .id(100L)
      .email("paciente@teste.com")
      .authorities(List.of(new SimpleGrantedAuthority("ROLE_PATIENT")))
      .build();

    UsernamePasswordAuthenticationToken auth =
      new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

    mockMvc.perform(post("/appointments/patient")
        .with(authentication(auth))
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.message").value("Consulta agendada."));
  }
}