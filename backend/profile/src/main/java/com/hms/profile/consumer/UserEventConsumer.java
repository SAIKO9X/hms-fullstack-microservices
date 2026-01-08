package com.hms.profile.consumer;

import com.hms.profile.dto.event.UserCreatedEvent;
import com.hms.profile.entities.Doctor;
import com.hms.profile.entities.Patient;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.repositories.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
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
      log.error("Erro ao processar evento de criação de perfil para usuário ID: " + event.userId(), e);
    }
  }

  private void createPatientProfile(UserCreatedEvent event) {
    if (patientRepository.existsByUserId(event.userId())) {
      log.warn("Perfil de paciente já existe para userId: {}", event.userId());
      return;
    }

    Patient patient = new Patient();
    patient.setUserId(event.userId());
    patient.setName(event.name());
    patient.setCpf(event.cpf());
    patientRepository.save(patient);
    log.info("Perfil de Paciente criado com sucesso para userId: {}", event.userId());
  }

  private void createDoctorProfile(UserCreatedEvent event) {
    if (doctorRepository.existsByUserId(event.userId())) {
      log.warn("Perfil de médico já existe para userId: {}", event.userId());
      return;
    }

    Doctor doctor = new Doctor();
    doctor.setUserId(event.userId());
    doctor.setName(event.name());
    doctor.setCrmNumber(event.crm());
    doctorRepository.save(doctor);
    log.info("Perfil de Médico criado com sucesso para userId: {}", event.userId());
  }
}