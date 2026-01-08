package com.hms.profile.services.impl;

import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.event.DoctorEvent;
import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.exceptions.ProfileAlreadyExistsException;
import com.hms.profile.exceptions.ProfileNotFoundException;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.services.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
      throw new ProfileAlreadyExistsException("Um perfil para este doutor (userId ou CRM) já existe.");
    }

    Doctor newDoctor = new Doctor();
    newDoctor.setUserId(request.userId());
    newDoctor.setCrmNumber(request.crmNumber());
    newDoctor.setName(request.name());

    Doctor savedDoctor = doctorRepository.save(newDoctor);
    publishDoctorEvent(savedDoctor, "CREATED");
    return DoctorResponse.fromEntity(savedDoctor);
  }

  @Override
  @Transactional(readOnly = true)
  public DoctorResponse getDoctorProfileByUserId(Long userId) {
    return doctorRepository.findByUserId(userId)
      .map(DoctorResponse::fromEntity)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil de doutor não encontrado para o usuário com ID: " + userId));
  }

  @Override
  public DoctorResponse updateDoctorProfile(Long userId, DoctorUpdateRequest request) {
    Doctor doctorToUpdate = doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil de doutor não encontrado para o usuário com ID: " + userId));

    if (request.name() != null && !request.name().isBlank()) {
      doctorToUpdate.setName(request.name());
    }
    if (request.dateOfBirth() != null) {
      doctorToUpdate.setDateOfBirth(request.dateOfBirth());
    }
    if (request.specialization() != null && !request.specialization().isBlank()) {
      doctorToUpdate.setSpecialization(request.specialization());
    }
    if (request.department() != null && !request.department().isBlank()) {
      doctorToUpdate.setDepartment(request.department());
    }
    if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
      doctorToUpdate.setPhoneNumber(request.phoneNumber());
    }
    if (request.yearsOfExperience() > 0) {
      doctorToUpdate.setYearsOfExperience(request.yearsOfExperience());
    }
    if (request.qualifications() != null) {
      doctorToUpdate.setQualifications(request.qualifications());
    }
    if (request.biography() != null) {
      doctorToUpdate.setBiography(request.biography());
    }

    Doctor updatedDoctor = doctorRepository.save(doctorToUpdate);
    publishDoctorEvent(updatedDoctor, "UPDATED");
    return DoctorResponse.fromEntity(updatedDoctor);
  }

  @Override
  public boolean doctorProfileExists(Long userId) {
    return doctorRepository.existsByUserId(userId);
  }

  @Override
  public List<DoctorDropdownResponse> getDoctorsForDropdown() {
    return doctorRepository.findAllForDropdown();
  }

  @Override
  @Transactional(readOnly = true)
  public Page<DoctorResponse> findAllDoctors(Pageable pageable) {
    return doctorRepository.findAll(pageable)
      .map(DoctorResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public DoctorResponse getDoctorProfileById(Long id) {
    return doctorRepository.findById(id)
      .map(DoctorResponse::fromEntity)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil de médico não encontrado para o ID: " + id));
  }

  @Override
  public void updateProfilePicture(Long userId, String pictureUrl) {
    Doctor doctor = doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));
    doctor.setProfilePictureUrl(pictureUrl);

    Doctor savedDoctor = doctorRepository.save(doctor);
    publishDoctorEvent(savedDoctor, "UPDATED");
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorStatusResponse> getDoctorsWithStatus() {
    List<Doctor> doctors = doctorRepository.findAll();
    List<Long> activeDoctorIds = appointmentFeignClient.getActiveDoctorIds();

    return doctors.stream().map(doctor -> new DoctorStatusResponse(
      doctor.getId(),
      doctor.getName(),
      doctor.getSpecialization(),
      activeDoctorIds.contains(doctor.getUserId()) ? "Em Consulta" : "Disponível",
      doctor.getProfilePictureUrl()
    )).collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void adminUpdateDoctor(Long userId, AdminDoctorUpdateRequest request) {
    Doctor doctor = doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil do médico não encontrado para o ID de usuário: " + userId));

    if (request.name() != null && !request.name().isBlank()) {
      doctor.setName(request.name());
    }
    if (request.crmNumber() != null) {
      doctor.setCrmNumber(request.crmNumber());
    }
    if (request.specialization() != null) {
      doctor.setSpecialization(request.specialization());
    }
    if (request.department() != null) {
      doctor.setDepartment(request.department());
    }
    if (request.phoneNumber() != null) {
      doctor.setPhoneNumber(request.phoneNumber());
    }
    if (request.biography() != null) {
      doctor.setBiography(request.biography());
    }
    if (request.qualifications() != null) {
      doctor.setQualifications(request.qualifications());
    }
    if (request.dateOfBirth() != null) {
      doctor.setDateOfBirth(request.dateOfBirth());
    }
    if (request.yearsOfExperience() != null) {
      doctor.setYearsOfExperience(request.yearsOfExperience());
    }

    Doctor savedDoctor = doctorRepository.save(doctor);

    // Publicar Evento de Atualização (Admin)
    publishDoctorEvent(savedDoctor, "UPDATED");
  }

  @Override
  public long countAllDoctors() {
    return doctorRepository.count();
  }

  // Método Auxiliar para RabbitMQ
  private void publishDoctorEvent(Doctor doctor, String eventType) {
    try {
      DoctorEvent event = new DoctorEvent(
        doctor.getId(),
        doctor.getUserId(),
        doctor.getName(),
        doctor.getSpecialization(),
        eventType
      );

      String routingKey = "doctor." + eventType.toLowerCase();
      rabbitTemplate.convertAndSend(exchange, routingKey, event);
      log.info("Evento publicado no RabbitMQ: Exchange='{}', Key='{}', Médico='{}'", exchange, routingKey, doctor.getName());
    } catch (Exception e) {
      log.error("Falha ao publicar evento do médico no RabbitMQ", e);
    }
  }
}