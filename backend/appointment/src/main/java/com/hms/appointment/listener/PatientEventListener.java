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

    repository.findByUserId(event.userId()).ifPresentOrElse(
      patient -> {
        // Se o paciente já existe, atualiza o email
        patient.setEmail(event.email());
        repository.save(patient);
        log.info("Email atualizado para o paciente ID {}", patient.getPatientId());
      },
      () -> {
        // Em um sistema real, isso iria numa tabela temporária "UserEmailCache".
        // Para simplificar o projeto apenas logo um aviso.
        log.warn("Paciente ainda não existe para UserID {}. Email pendente.", event.userId());
      }
    );
  }
}