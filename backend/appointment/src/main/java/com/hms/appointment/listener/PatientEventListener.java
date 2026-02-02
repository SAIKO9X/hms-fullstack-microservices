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
    PatientEvent event = envelope.getPayload();
    log.info("Sincronizando Patient (Profile): PatientID {}", event.patientId());

    PatientReadModel patient = repository.findById(event.patientId())
      .orElse(new PatientReadModel());

    patient.setPatientId(event.patientId());
    patient.setUserId(event.userId());
    if (event.fullName() != null) patient.setFullName(event.fullName());
    if (event.phoneNumber() != null) patient.setPhoneNumber(event.phoneNumber());

    repository.save(patient);
  }

  @RabbitListener(queues = RabbitMQConfig.USER_SYNC_QUEUE)
  public void handleUserCreated(EventEnvelope<UserCreatedEvent> envelope) {
    UserCreatedEvent event = envelope.getPayload();
    log.info("Sincronizando Patient (User Email): UserID {}", event.userId());

    Optional<PatientReadModel> patientOpt = repository.findByUserId(event.userId());

    if (patientOpt.isPresent()) {
      PatientReadModel patient = patientOpt.get();
      patient.setEmail(event.email());
      repository.save(patient);
    } else {
      PatientReadModel partial = new PatientReadModel();
      partial.setUserId(event.userId());
      partial.setEmail(event.email());
      // id e nome virão depois pelo evento PATIENT_QUEUE
    }
  }
}