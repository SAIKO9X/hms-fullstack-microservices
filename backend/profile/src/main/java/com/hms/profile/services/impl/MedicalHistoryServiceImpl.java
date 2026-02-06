package com.hms.profile.services.impl;

import com.hms.common.dto.response.ApiResponse;
import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.response.AppointmentHistoryDto;
import com.hms.profile.dto.response.AppointmentResponse;
import com.hms.profile.dto.response.MedicalHistoryResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.services.MedicalHistoryService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalHistoryServiceImpl implements MedicalHistoryService {

  private final AppointmentFeignClient appointmentFeignClient;
  private final DoctorRepository doctorRepository;

  @Override
  public MedicalHistoryResponse getPatientMedicalHistory(Long patientId) {
    return fetchAndProcessHistory(patientId);
  }

  @Override
  public MedicalHistoryResponse getMedicalHistoryByPatientProfileId(Long patientProfileId) {
    return fetchAndProcessHistory(patientProfileId);
  }

  @CircuitBreaker(name = "appointmentService", fallbackMethod = "fetchHistoryFallback")
  public MedicalHistoryResponse fetchAndProcessHistory(Long patientProfileId) {
    ApiResponse<List<AppointmentResponse>> response = appointmentFeignClient.getAppointmentHistoryForPatient(patientProfileId);

    List<AppointmentResponse> appointmentsFromService;
    if (response != null && response.data() != null) {
      appointmentsFromService = response.data();
    } else {
      appointmentsFromService = Collections.emptyList();
    }

    if (appointmentsFromService.isEmpty()) {
      return new MedicalHistoryResponse(Collections.emptyList());
    }

    List<Long> doctorIds = appointmentsFromService.stream()
      .map(AppointmentResponse::doctorId)
      .distinct()
      .collect(Collectors.toList());

    Map<Long, Doctor> doctorsMap = doctorRepository.findAllByUserIdIn(doctorIds).stream()
      .collect(Collectors.toMap(Doctor::getUserId, Function.identity()));

    List<AppointmentHistoryDto> appointmentHistories = appointmentsFromService.stream().map(app -> {
      Doctor doctor = doctorsMap.get(app.doctorId());
      String doctorName = (doctor != null) ? doctor.getName() : "Médico Desconhecido";

      return new AppointmentHistoryDto(
        app.id(),
        app.appointmentDateTime(),
        app.reason(),
        app.status().name(),
        doctorName
      );
    }).collect(Collectors.toList());

    return new MedicalHistoryResponse(appointmentHistories);
  }

  // Método de fallback para Circuit Breaker
  public MedicalHistoryResponse fetchHistoryFallback(Long patientProfileId, Exception e) {
    log.error("Falha ao buscar histórico de consultas (Circuit Breaker): {}", e.getMessage());
    return new MedicalHistoryResponse(Collections.emptyList());
  }
}