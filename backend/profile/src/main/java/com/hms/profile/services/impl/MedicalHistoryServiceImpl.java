package com.hms.profile.services.impl;

import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.response.AppointmentHistoryDto;
import com.hms.profile.dto.response.AppointmentResponse;
import com.hms.profile.dto.response.MedicalHistoryResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.services.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalHistoryServiceImpl implements MedicalHistoryService {

  private final AppointmentFeignClient appointmentFeignClient;
  private final DoctorRepository doctorRepository;

  @Override
  public MedicalHistoryResponse getPatientMedicalHistory(Long patientId) {
    List<AppointmentResponse> appointmentsFromService = appointmentFeignClient.getAppointmentHistoryForPatient(patientId);

    if (appointmentsFromService == null || appointmentsFromService.isEmpty()) {
      return new MedicalHistoryResponse(Collections.emptyList());
    }

    // Extrai os IDs dos médicos para uma busca otimizada
    List<Long> doctorIds = appointmentsFromService.stream()
      .map(AppointmentResponse::doctorId)
      .distinct()
      .collect(Collectors.toList());

    // Busca todos os médicos necessários numa única query
    Map<Long, Doctor> doctorsMap = doctorRepository.findAllByUserIdIn(doctorIds).stream()
      .collect(Collectors.toMap(Doctor::getUserId, Function.identity()));

    List<AppointmentHistoryDto> appointmentHistories = appointmentsFromService.stream().map(app -> {
      Doctor doctor = doctorsMap.get(app.doctorId());
      String doctorName = (doctor != null) ? doctor.getName() : "Médico não encontrado";
      return new AppointmentHistoryDto(
        app.id(),
        app.appointmentDateTime(),
        app.reason(),
        app.status().name(), // Converte o Enum para String
        doctorName
      );
    }).collect(Collectors.toList());

    return new MedicalHistoryResponse(appointmentHistories);
  }
}