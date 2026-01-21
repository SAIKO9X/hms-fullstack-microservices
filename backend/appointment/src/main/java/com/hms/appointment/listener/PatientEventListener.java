package com.hms.appointment.listener;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.PatientEvent;
import com.hms.appointment.dto.event.UserCreatedEvent;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.repositories.PatientReadModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class PatientEventListener {

  private final PatientReadModelRepository repository;

  // Recebe dados do Perfil (Nome, Telefone, IDs)
  @RabbitListener(queues = RabbitMQConfig.PATIENT_QUEUE)
  public void handlePatientEvent(PatientEvent event) {
    log.info("Sincronizando Patient ReadModel (Profile): PatientID {}", event.patientId());

    PatientReadModel patient = repository.findById(event.patientId())
      .orElse(new PatientReadModel());

    patient.setPatientId(event.patientId());
    patient.setUserId(event.userId());

    if (event.fullName() != null) patient.setFullName(event.fullName());
    if (event.phoneNumber() != null) patient.setPhoneNumber(event.phoneNumber());

    repository.save(patient);
  }

  // Recebe dados do User (Email)
  @RabbitListener(queues = RabbitMQConfig.USER_SYNC_QUEUE)
  public void handleUserCreated(UserCreatedEvent event) {
    log.info("Sincronizando Patient ReadModel (User Email): UserID {}", event.userId());

    Optional<PatientReadModel> patientOpt = repository.findByUserId(event.userId());

    if (patientOpt.isPresent()) {
      PatientReadModel patient = patientOpt.get();
      patient.setEmail(event.email());
      repository.save(patient);
      log.info("Email atualizado para o paciente ID {}", patient.getPatientId());
    } else {
      log.warn("Paciente ainda não encontrado para UserID {}. O email será atualizado quando o evento do Paciente chegar.", event.userId());

      PatientReadModel partial = new PatientReadModel();
      partial.setUserId(event.userId());
      partial.setEmail(event.email());
    }
  }
}