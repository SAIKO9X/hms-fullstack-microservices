package com.hms.profile.services.impl;

import com.hms.common.dto.event.EventEnvelope;
import com.hms.common.exceptions.ResourceAlreadyExistsException;
import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.event.DoctorEvent;
import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.services.DoctorService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DoctorServiceImpl implements DoctorService {

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  private final DoctorRepository doctorRepository;
  private final AppointmentFeignClient appointmentFeignClient;
  private final RabbitTemplate rabbitTemplate;

  @Override
  public DoctorResponse createDoctorProfile(DoctorCreateRequest request) {
    if (doctorRepository.existsByUserIdOrCrmNumber(request.userId(), request.crmNumber())) {
      throw new ResourceAlreadyExistsException("Doctor Profile", "userId/CRM");
    }
    Doctor newDoctor = Doctor.builder()
      .userId(request.userId())
      .crmNumber(request.crmNumber())
      .name(request.name())
      .build();
    Doctor saved = doctorRepository.save(newDoctor);
    publishDoctorEvent(saved, "CREATED");
    return DoctorResponse.fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "doctorsByUserId", key = "#userId")
  public DoctorResponse getDoctorProfileByUserId(Long userId) {
    return doctorRepository.findByUserId(userId)
      .map(DoctorResponse::fromEntity)
      .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile", userId));
  }

  @Override
  @CachePut(value = "doctorsByUserId", key = "#userId")
  public DoctorResponse updateDoctorProfile(Long userId, DoctorUpdateRequest request) {
    Doctor doctor = findDoctorByUserId(userId);
    applyDoctorUpdates(doctor, request);
    Doctor updated = doctorRepository.save(doctor);
    publishDoctorEvent(updated, "UPDATED");
    return DoctorResponse.fromEntity(updated);
  }

  @Override
  @Transactional(readOnly = true)
  public boolean doctorProfileExists(Long userId) {
    return doctorRepository.existsByUserId(userId);
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorDropdownResponse> getDoctorsForDropdown() {
    return doctorRepository.findAllForDropdown();
  }

  @Override
  @Transactional(readOnly = true)
  public Page<DoctorResponse> findAllDoctors(Pageable pageable) {
    return doctorRepository.findAll(pageable).map(DoctorResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "doctors", key = "#id")
  public DoctorResponse getDoctorProfileById(Long id) {
    return doctorRepository.findById(id)
      .map(DoctorResponse::fromEntity)
      .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile", id));
  }

  @Override
  @CacheEvict(value = "doctorsByUserId", key = "#userId")
  public void updateProfilePicture(Long userId, String pictureUrl) {
    Doctor doctor = findDoctorByUserId(userId);
    doctor.setProfilePictureUrl(pictureUrl);
    Doctor saved = doctorRepository.save(doctor);
    publishDoctorEvent(saved, "UPDATED");
  }

  @Override
  @Transactional(readOnly = true)
  @CircuitBreaker(name = "appointmentService", fallbackMethod = "getDoctorsWithStatusFallback")
  public List<DoctorStatusResponse> getDoctorsWithStatus() {
    List<Doctor> doctors = doctorRepository.findAllCompleteProfiles();

    List<Long> activeDoctorIds = appointmentFeignClient.getActiveDoctorIds();
    return mapDoctorsToStatusResponse(doctors, activeDoctorIds);
  }

  public List<DoctorStatusResponse> getDoctorsWithStatusFallback(Throwable e) {
    log.warn("Circuit Breaker ativado - Appointment Service indisponível: {}", e.getMessage());
    List<Doctor> doctors = doctorRepository.findAllCompleteProfiles();
    return mapDoctorsToStatusResponse(doctors, Collections.emptyList());
  }

  @Override
  @Transactional
  @CacheEvict(value = "doctorsByUserId", key = "#userId")
  public void adminUpdateDoctor(Long userId, AdminDoctorUpdateRequest request) {
    Doctor doctor = findDoctorByUserId(userId);
    applyAdminUpdates(doctor, request);
    Doctor saved = doctorRepository.save(doctor);
    publishDoctorEvent(saved, "UPDATED");
  }

  @Override
  @Transactional(readOnly = true)
  public long countAllDoctors() {
    return doctorRepository.count();
  }

  private Doctor findDoctorByUserId(Long userId) {
    return doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile", userId));
  }

  private void applyDoctorUpdates(Doctor doctor, DoctorUpdateRequest request) {
    updateStringField(request.name(), doctor::setName);
    updateField(request.dateOfBirth(), doctor::setDateOfBirth);
    updateStringField(request.specialization(), doctor::setSpecialization);
    updateStringField(request.department(), doctor::setDepartment);
    updateStringField(request.phoneNumber(), doctor::setPhoneNumber);
    updateIntegerField(request.yearsOfExperience(), doctor::setYearsOfExperience);
    updateStringField(request.qualifications(), doctor::setQualifications);
    updateStringField(request.biography(), doctor::setBiography);
    updateField(request.consultationFee(), doctor::setConsultationFee);
  }

  private void applyAdminUpdates(Doctor doctor, AdminDoctorUpdateRequest request) {
    updateStringField(request.name(), doctor::setName);
    updateStringField(request.crmNumber(), doctor::setCrmNumber);
    updateStringField(request.specialization(), doctor::setSpecialization);
    updateStringField(request.department(), doctor::setDepartment);
    updateStringField(request.phoneNumber(), doctor::setPhoneNumber);
    updateStringField(request.biography(), doctor::setBiography);
    updateStringField(request.qualifications(), doctor::setQualifications);
    updateField(request.dateOfBirth(), doctor::setDateOfBirth);
    updateField(request.yearsOfExperience(), doctor::setYearsOfExperience);
  }

  private void updateStringField(String value, Consumer<String> setter) {
    if (value != null && !value.isBlank()) setter.accept(value);
  }

  private void updateIntegerField(Integer value, Consumer<Integer> setter) {
    if (value != null && value > 0) setter.accept(value);
  }

  private <T> void updateField(T value, Consumer<T> setter) {
    if (value != null) setter.accept(value);
  }

  private List<DoctorStatusResponse> mapDoctorsToStatusResponse(List<Doctor> doctors, List<Long> activeIds) {
    return doctors.stream()
      .map(doctor -> new DoctorStatusResponse(
        doctor.getId(),
        doctor.getName(),
        doctor.getSpecialization(),
        activeIds.contains(doctor.getUserId()) ? "Em Consulta" : "Disponível",
        doctor.getProfilePictureUrl()
      ))
      .collect(Collectors.toList());
  }


  private void publishDoctorEvent(Doctor doctor, String eventType) {
    try {
      DoctorEvent eventPayload = new DoctorEvent(
        doctor.getId(),
        doctor.getUserId(),
        doctor.getName(),
        doctor.getSpecialization(),
        eventType
      );

      String routingKey = "doctor." + eventType.toLowerCase();

      // Gera correlationId (em produção viria do MDC ou Contexto de Rastreamento)
      String correlationId = UUID.randomUUID().toString();

      // Cria o envelope
      EventEnvelope<DoctorEvent> envelope = EventEnvelope.create(
        "DOCTOR_" + eventType, // ex: DOCTOR_CREATED
        correlationId,
        eventPayload
      );

      rabbitTemplate.convertAndSend(exchange, routingKey, envelope);

      log.info("Evento publicado: Exchange='{}', Key='{}', ID='{}', EnvelopeID='{}'",
        exchange, routingKey, doctor.getName(), envelope.getEventId());
    } catch (Exception e) {
      log.error("Falha ao publicar evento do médico no RabbitMQ: {}", e.getMessage(), e);
    }
  }
}