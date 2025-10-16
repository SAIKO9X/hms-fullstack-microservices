package com.hms.profile.services.impl;

import com.hms.profile.dto.request.AdminPatientUpdateRequest;
import com.hms.profile.dto.request.PatientCreateRequest;
import com.hms.profile.dto.request.PatientUpdateRequest;
import com.hms.profile.dto.response.PatientDropdownResponse;
import com.hms.profile.dto.response.PatientResponse;
import com.hms.profile.entities.Patient;
import com.hms.profile.exceptions.ProfileAlreadyExistsException;
import com.hms.profile.exceptions.ProfileNotFoundException;
import com.hms.profile.repositories.PatientRepository;
import com.hms.profile.services.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

  private final PatientRepository patientRepository;

  @Override
  public PatientResponse createPatientProfile(PatientCreateRequest request) {
    if (patientRepository.existsByUserIdOrCpf(request.userId(), request.cpf())) {
      throw new ProfileAlreadyExistsException("Um perfil para este usuário ou CPF já existe.");
    }

    // Mapeamento do DTO para a Entidade
    Patient newPatient = new Patient();
    newPatient.setUserId(request.userId());
    newPatient.setCpf(request.cpf());
    newPatient.setName(request.name());

    Patient savedPatient = patientRepository.save(newPatient);

    // Converte a entidade salva para o DTO de resposta
    return PatientResponse.fromEntity(savedPatient);
  }

  @Override
  @Transactional(readOnly = true)
  public PatientResponse getPatientProfileById(Long profileId) {
    return patientRepository.findById(profileId)
      .map(PatientResponse::fromEntity) // Mapeamento usando o método de fábrica
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
    // Busca a entidade existente pelo userId
    Patient patientToUpdate = patientRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));

    // Mapeia os campos do DTO de atualização para a entidade existente
    patientToUpdate.setName(request.name());
    patientToUpdate.setGender(request.gender());
    patientToUpdate.setDateOfBirth(request.dateOfBirth());
    patientToUpdate.setPhoneNumber(request.phoneNumber());
    patientToUpdate.setBloodGroup(request.bloodGroup());
    patientToUpdate.setAddress(request.address());
    patientToUpdate.setEmergencyContactName(request.emergencyContactName());
    patientToUpdate.setEmergencyContactPhone(request.emergencyContactPhone());
    patientToUpdate.setAllergies(request.allergies());
    patientToUpdate.setChronicDiseases(request.chronicDiseases());

    Patient updatedPatient = patientRepository.save(patientToUpdate);

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
  public List<PatientResponse> findAllPatients() {
    return patientRepository.findAll().stream()
      .map(PatientResponse::fromEntity)
      .collect(Collectors.toList());
  }

  @Override
  public void updateProfilePicture(Long userId, String pictureUrl) {
    Patient patient = patientRepository.findByUserId(userId)
      .orElseThrow(() -> new ProfileNotFoundException("Perfil não encontrado para o usuário com ID: " + userId));
    patient.setProfilePictureUrl(pictureUrl);
    patientRepository.save(patient);
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
      patient.setBloodGroup(request.bloodGroup());
    }
    if (request.gender() != null) {
      patient.setGender(request.gender());
    }
    if (request.chronicDiseases() != null) {
      patient.setChronicDiseases(request.chronicDiseases());
    }
    if (request.allergies() != null) {
      patient.setAllergies(request.allergies());
    }

    patientRepository.save(patient);
  }

  @Override
  public long countAllPatients() {
    return patientRepository.count();
  }
}