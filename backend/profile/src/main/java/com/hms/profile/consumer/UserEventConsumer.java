package com.hms.profile.consumer;

import com.hms.profile.dto.event.UserCreatedEvent;
import com.hms.profile.dto.event.UserUpdatedEvent;
import com.hms.profile.entities.Doctor;
import com.hms.profile.entities.Patient;
import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.repositories.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {

  private final PatientRepository patientRepository;
  private final DoctorRepository doctorRepository;

  @RabbitListener(queues = "${application.rabbitmq.user-created-queue}")
  @Transactional
  public void consumeUserCreatedEvent(UserCreatedEvent event) {
    log.info("Recebido evento de criação de usuário: ID {}, Role {}", event.userId(), event.role());

    try {
      if ("PATIENT".equalsIgnoreCase(event.role())) {
        createPatientProfile(event);
      } else if ("DOCTOR".equalsIgnoreCase(event.role())) {
        createDoctorProfile(event);
      } else {
        log.warn("Role desconhecida ou ignorada para criação de perfil: {}", event.role());
      }
    } catch (Exception e) {
      log.error("Erro ao processar evento de criação de perfil para usuário ID: {}", event.userId(), e);
      throw e;
    }
  }

  @RabbitListener(queues = "${application.rabbitmq.user-updated-queue}")
  @Transactional
  public void consumeUserUpdatedEvent(UserUpdatedEvent event) {
    log.info("Recebido evento de atualização de usuário: ID {}, Role {}", event.userId(), event.role());

    try {
      String role = event.role() != null ? event.role() : "";

      if ("PATIENT".equalsIgnoreCase(role)) {
        updatePatientProfile(event);
      } else if ("DOCTOR".equalsIgnoreCase(role)) {
        updateDoctorProfile(event);
      } else {
        log.warn("Role desconhecida ou não requer atualização de perfil: {}", role);
      }
    } catch (Exception e) {
      log.error("Erro ao processar evento de atualização para usuário ID {}: {}",
        event.userId(), e.getMessage(), e);
      throw e;
    }
  }

  private void createPatientProfile(UserCreatedEvent event) {
    if (patientRepository.existsByUserId(event.userId())) return;
    Patient patient = new Patient();
    patient.setUserId(event.userId());
    patient.setName(event.name());
    patient.setCpf(event.cpf());
    patientRepository.save(patient);
    log.info("Perfil de Paciente criado com sucesso para userId: {}", event.userId());
  }

  private void createDoctorProfile(UserCreatedEvent event) {
    if (doctorRepository.existsByUserId(event.userId())) return;
    Doctor doctor = new Doctor();
    doctor.setUserId(event.userId());
    doctor.setName(event.name());
    doctor.setCrmNumber(event.crm());
    doctorRepository.save(doctor);
    log.info("Perfil de Médico criado com sucesso para userId: {}", event.userId());
  }

  private void updatePatientProfile(UserUpdatedEvent event) {
    patientRepository.findByUserId(event.userId()).ifPresentOrElse(
      patient -> {
        if (event.name() != null) patient.setName(event.name());
        if (event.cpf() != null) patient.setCpf(event.cpf());
        if (event.phone() != null) patient.setPhoneNumber(event.phone());
        if (event.address() != null) patient.setAddress(event.address());
        if (event.emergencyContactName() != null) patient.setEmergencyContactName(event.emergencyContactName());
        if (event.emergencyContactPhone() != null) patient.setEmergencyContactPhone(event.emergencyContactPhone());
        if (event.bloodGroup() != null && !event.bloodGroup().isBlank()) {
          try {
            patient.setBloodGroup(BloodGroup.valueOf(event.bloodGroup()));
          } catch (IllegalArgumentException e) {
            log.warn("Grupo sanguíneo inválido recebido no evento: {}", event.bloodGroup());
          }
        }
        if (event.gender() != null && !event.gender().isBlank()) {
          try {
            patient.setGender(Gender.valueOf(event.gender()));
          } catch (IllegalArgumentException e) {
            log.warn("Gênero inválido recebido no evento: {}", event.gender());
          }
        }
        if (event.dateOfBirth() != null) patient.setDateOfBirth(event.dateOfBirth());
        if (event.chronicDiseases() != null) patient.setChronicConditions(event.chronicDiseases());
        if (event.allergies() != null) {
          if (event.allergies().isBlank()) {
            patient.setAllergies(Collections.emptySet());
          } else {
            patient.setAllergies(
              Arrays.stream(event.allergies().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet())
            );
          }
        }

        patientRepository.save(patient);
        log.info("Perfil de Paciente atualizado com sucesso para userId: {}", event.userId());
      },
      () -> log.warn("Perfil de paciente não encontrado para userId: {}", event.userId())
    );
  }

  private void updateDoctorProfile(UserUpdatedEvent event) {
    doctorRepository.findByUserId(event.userId()).ifPresentOrElse(
      doctor -> {
        if (event.name() != null) doctor.setName(event.name());
        if (event.crm() != null) doctor.setCrmNumber(event.crm());
        if (event.specialization() != null) doctor.setSpecialization(event.specialization());
        if (event.department() != null) doctor.setDepartment(event.department());
        if (event.phone() != null) doctor.setPhoneNumber(event.phone());
        if (event.biography() != null) doctor.setBiography(event.biography());
        if (event.qualifications() != null) doctor.setQualifications(event.qualifications());
        if (event.dateOfBirth() != null) doctor.setDateOfBirth(event.dateOfBirth());
        if (event.yearsOfExperience() != null) doctor.setYearsOfExperience(event.yearsOfExperience());

        doctorRepository.save(doctor);
        log.info("Perfil de Médico atualizado com sucesso para userId: {}", event.userId());
      },
      () -> log.warn("Perfil de médico não encontrado para userId: {}", event.userId())
    );
  }
}