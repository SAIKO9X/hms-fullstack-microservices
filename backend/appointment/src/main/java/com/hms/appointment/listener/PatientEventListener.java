package com.hms.appointment.listener;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.request.PatientEvent;
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

  @RabbitListener(queues = RabbitMQConfig.PATIENT_QUEUE)
  public void handlePatientEvent(PatientEvent event) {
    log.info("Recebido evento de paciente: {} - {}", event.eventType(), event.fullName());

    PatientReadModel patient = new PatientReadModel(
      event.patientId(),
      event.userId(),
      event.fullName(),
      event.phoneNumber()
    );

    repository.save(patient); // Upsert (Salva ou Atualiza)
    log.info("Modelo de leitura do paciente atualizado com sucesso.");
  }
}