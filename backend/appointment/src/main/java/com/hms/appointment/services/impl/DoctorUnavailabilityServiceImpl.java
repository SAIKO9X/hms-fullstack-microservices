package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.DoctorUnavailabilityRequest;
import com.hms.appointment.dto.response.DoctorUnavailabilityResponse;
import com.hms.appointment.entities.DoctorUnavailability;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorUnavailabilityRepository;
import com.hms.appointment.services.DoctorUnavailabilityService;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorUnavailabilityServiceImpl implements DoctorUnavailabilityService {

  private final DoctorUnavailabilityRepository repository;
  private final AppointmentRepository appointmentRepository;

  @Override
  @Transactional
  public DoctorUnavailabilityResponse createUnavailability(DoctorUnavailabilityRequest request) {
    if (request.startDateTime().isAfter(request.endDateTime())) {
      throw new InvalidOperationException("A data de início deve ser anterior à data de fim.");
    }

    boolean hasOverlap = repository.hasUnavailability(
      request.doctorId(),
      request.startDateTime(),
      request.endDateTime()
    );

    if (hasOverlap) {
      throw new InvalidOperationException("Já existe um período de indisponibilidade registrado neste intervalo.");
    }

    boolean hasAppointments = appointmentRepository.hasDoctorConflict(
      request.doctorId(),
      request.startDateTime(),
      request.endDateTime()
    );

    if (hasAppointments) {
      throw new InvalidOperationException("Não é possível bloquear a agenda: Existem consultas agendadas neste período. Cancele ou remarque as consultas existentes primeiro.");
    }

    DoctorUnavailability entity = DoctorUnavailability.builder()
      .doctorId(request.doctorId())
      .startDateTime(request.startDateTime())
      .endDateTime(request.endDateTime())
      .reason(request.reason())
      .build();

    DoctorUnavailability saved = repository.save(entity);
    return mapToResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorUnavailabilityResponse> getUnavailabilityByDoctor(Long doctorId) {
    return repository.findByDoctorId(doctorId).stream()
      .map(this::mapToResponse)
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void deleteUnavailability(Long id) {
    if (!repository.existsById(id)) {
      throw new ResourceNotFoundException("Doctor Unavailability", id);
    }
    repository.deleteById(id);
  }

  private DoctorUnavailabilityResponse mapToResponse(DoctorUnavailability entity) {
    return new DoctorUnavailabilityResponse(
      entity.getId(),
      entity.getDoctorId(),
      entity.getStartDateTime(),
      entity.getEndDateTime(),
      entity.getReason()
    );
  }
}