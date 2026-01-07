package com.hms.profile.services.impl;

import com.hms.profile.dto.request.AdminPatientUpdateRequest;
import com.hms.profile.dto.request.PatientCreateRequest;
import com.hms.profile.dto.request.PatientEvent;
import com.hms.profile.dto.request.PatientUpdateRequest;
import com.hms.profile.dto.response.PatientDropdownResponse;
import com.hms.profile.dto.response.PatientResponse;
import com.hms.profile.entities.Patient;
import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
import com.hms.profile.exceptions.ProfileAlreadyExistsException;
import com.hms.profile.exceptions.ProfileNotFoundException;
import com.hms.profile.repositories.PatientRepository;
import com.hms.profile.services.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {

  private final PatientRepository patientRepository;
  private final RabbitTemplate rabbitTemplate;

  @Override
  public PatientResponse createPatientProfile(PatientCreateRequest request) {
    if (patientRepository.existsByUserIdOrCpf(request.userId(), request.cpf())) {
      throw new ProfileAlreadyExistsException("Um perfil para este usuário ou CPF já existe.");
    }

    Patient newPatient = new Patient();
    newPatient.setUserId(request.userId());
    newPatient.setCpf(request.cpf());
    newPatient.setName(request.name());

    Patient savedPatient = patientRepository.save(newPatient);
    publishPatientEvent(savedPatient, "CREATED");

    return PatientResponse.fromEntity(savedPatient);
  }

  @Override
  @Transactional(readOnly = true)
  public PatientResponse getPatientProfileById(Long profileId) {
    return patientRepository.findById(profileId)
      .map(PatientResponse::fromEntity)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado com o ID: " + profileId));
  }

  @Override
  @Transactional(readOnly = true)
  public PatientResponse getPatientProfileByUserId(Long userId) {
    return patientRepository.findByUserId(userId)
      .map(PatientResponse::fromEntity)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));
  }

  @Override
  public PatientResponse updatePatientProfile(Long userId, PatientUpdateRequest request) {
    Patient patientToUpdate = patientRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));

    if (request.name() != null && !request.name().isBlank()) {
      patientToUpdate.setName(request.name());
    }
    if (request.gender() != null) {
      patientToUpdate.setGender(request.gender());
    }
    if (request.dateOfBirth() != null) {
      patientToUpdate.setDateOfBirth(request.dateOfBirth());
    }
    if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
      patientToUpdate.setPhoneNumber(request.phoneNumber());
    }
    if (request.bloodGroup() != null) {
      patientToUpdate.setBloodGroup(request.bloodGroup());
    }
    if (request.address() != null && !request.address().isBlank()) {
      patientToUpdate.setAddress(request.address());
    }
    if (request.emergencyContactName() != null && !request.emergencyContactName().isBlank()) {
      patientToUpdate.setEmergencyContactName(request.emergencyContactName());
    }
    if (request.emergencyContactPhone() != null && !request.emergencyContactPhone().isBlank()) {
      patientToUpdate.setEmergencyContactPhone(request.emergencyContactPhone());
    }
    if (request.allergies() != null) {
      patientToUpdate.setAllergies(request.allergies());
    }
    if (request.chronicDiseases() != null) {
      patientToUpdate.setChronicDiseases(request.chronicDiseases());
    }

    Patient updatedPatient = patientRepository.save(patientToUpdate);

    publishPatientEvent(updatedPatient, "UPDATED");

    return PatientResponse.fromEntity(updatedPatient);
  }

  @Override
  public boolean patientProfileExists(Long userId) {
    return patientRepository.existsByUserId(userId);
  }

  @Override
  public List<PatientDropdownResponse> getPatientsForDropdown() {
    return patientRepository.findAllForDropdown();
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PatientResponse> findAllPatients(Pageable pageable) {
    return patientRepository.findAll(pageable)
      .map(PatientResponse::fromEntity);
  }

  @Override
  public void updateProfilePicture(Long userId, String pictureUrl) {
    Patient patient = patientRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));
    patient.setProfilePictureUrl(pictureUrl);

    Patient savedPatient = patientRepository.save(patient);
    publishPatientEvent(savedPatient, "UPDATED");
  }

  @Override
  @Transactional
  public void adminUpdatePatient(Long userId, AdminPatientUpdateRequest request) {
    Patient patient = patientRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil do paciente não encontrado para o ID de usuário: " + userId));

    if (request.name() != null && !request.name().isBlank()) {
      patient.setName(request.name());
    }
    if (request.cpf() != null) {
      patient.setCpf(request.cpf());
    }
    if (request.phoneNumber() != null) {
      patient.setPhoneNumber(request.phoneNumber());
    }
    if (request.address() != null) {
      patient.setAddress(request.address());
    }
    if (request.emergencyContactName() != null) {
      patient.setEmergencyContactName(request.emergencyContactName());
    }
    if (request.emergencyContactPhone() != null) {
      patient.setEmergencyContactPhone(request.emergencyContactPhone());
    }
    if (request.bloodGroup() != null) {
      try {
        patient.setBloodGroup(BloodGroup.valueOf(request.bloodGroup()));
      } catch (IllegalArgumentException e) {
        System.err.println("Valor inválido para BloodGroup recebido: " + request.bloodGroup());
      }
    }
    if (request.gender() != null) {
      try {
        patient.setGender(Gender.valueOf(request.gender()));
      } catch (IllegalArgumentException e) {
        System.err.println("Valor inválido para Gender recebido: " + request.gender());
      }
    }
    if (request.dateOfBirth() != null) {
      patient.setDateOfBirth(request.dateOfBirth());
    }
    if (request.chronicDiseases() != null) {
      patient.setChronicDiseases(request.chronicDiseases());
    }
    if (request.allergies() != null) {
      patient.setAllergies(request.allergies());
    }

    Patient savedPatient = patientRepository.save(patient);
    publishPatientEvent(savedPatient, "UPDATED");
  }

  @Override
  public long countAllPatients() {
    return patientRepository.count();
  }

  // --- Método Auxiliar para RabbitMQ ---
  private void publishPatientEvent(Patient patient, String eventType) {
    try {
      PatientEvent event = new PatientEvent(
        patient.getId(),
        patient.getUserId(),
        patient.getName(),
        patient.getPhoneNumber(),
        eventType
      );

      // Routing key: patient.created ou patient.updated
      String routingKey = "patient." + eventType.toLowerCase();
      String exchangeName = "hms.exchange";
      rabbitTemplate.convertAndSend(exchangeName, routingKey, event);
      log.info("Evento publicado no RabbitMQ: {} para o paciente {}", routingKey, patient.getName());
    } catch (Exception e) {
      log.error("Falha ao publicar evento do paciente no RabbitMQ", e);
    }
  }
}