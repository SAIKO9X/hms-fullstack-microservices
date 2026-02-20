package com.hms.appointment.listener;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.PatientEvent;
import com.hms.appointment.dto.event.UserCreatedEvent;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.common.dto.event.EventEnvelope;
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

  @RabbitListener(queues = RabbitMQConfig.PATIENT_QUEUE)
  public void handlePatientEvent(EventEnvelope<PatientEvent> envelope) {
    try {
      PatientEvent event = envelope.getPayload();

      if (event.patientId() == null) {
        log.warn("Evento de paciente ignorado: patientId está NULO.");
        return;
      }

      log.info("Sincronizando Patient (Profile): PatientID {}", event.patientId());

      PatientReadModel patient = repository.findById(event.patientId())
        .orElseGet(() -> {
          PatientReadModel p = new PatientReadModel();
          p.setPatientId(event.patientId());
          return p;
        });

      if (event.userId() != null) patient.setUserId(event.userId());
      if (event.fullName() != null) patient.setFullName(event.fullName());
      if (event.phoneNumber() != null) patient.setPhoneNumber(event.phoneNumber());

      repository.save(patient);

    } catch (Exception e) {
      log.error("Erro ao processar PatientEvent. Descartando para evitar loop.", e);
    }
  }

  @RabbitListener(queues = RabbitMQConfig.USER_SYNC_QUEUE)
  public void handleUserCreated(EventEnvelope<UserCreatedEvent> envelope) {
    try {
      UserCreatedEvent event = envelope.getPayload();
      log.info("Sincronizando Patient (User Email): UserID {}", event.userId());

      Optional<PatientReadModel> patientOpt = repository.findByUserId(event.userId());

      if (patientOpt.isPresent()) {
        PatientReadModel patient = patientOpt.get();
        patient.setEmail(event.email());
        repository.save(patient);
      } else {
        // ignora a criação aqui, porque a PK (patientId) da tabela ainda não existe.
        log.warn("Usuário criado (ID: {}), mas o PatientProfile ainda não existe. E-mail será atualizado depois.", event.userId());
      }
    } catch (Exception e) {
      log.error("Erro ao processar UserCreatedEvent.", e);
    }
  }
}