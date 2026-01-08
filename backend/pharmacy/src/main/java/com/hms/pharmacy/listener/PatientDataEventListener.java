package com.hms.pharmacy.listener;

import com.hms.pharmacy.config.RabbitMQConfig;
import com.hms.pharmacy.dto.event.PatientEvent;
import com.hms.pharmacy.dto.event.UserCreatedEvent;
import com.hms.pharmacy.entities.PatientReadModel;
import com.hms.pharmacy.repositories.PatientReadModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PatientDataEventListener {

  private final PatientReadModelRepository repository;

  // Garante que temos o email e id (User Service)
  @RabbitListener(queues = RabbitMQConfig.USER_SYNC_QUEUE)
  public void handleUserCreated(UserCreatedEvent event) {
    log.info("Sincronizando usuário ID: {}", event.userId());

    PatientReadModel patient = repository.findById(event.userId())
      .orElse(new PatientReadModel());

    patient.setUserId(event.userId());
    patient.setEmail(event.email());
    patient.setName(event.name());

    repository.save(patient);
  }

  // Atualiza campos se não forem nulos (Profile Service)
  @RabbitListener(queues = RabbitMQConfig.PATIENT_SYNC_QUEUE)
  public void handlePatientEvent(PatientEvent event) {
    log.info("Sincronizando dados do paciente via evento Profile: {}", event.userId());

    PatientReadModel patient = repository.findById(event.userId())
      .orElse(new PatientReadModel());

    patient.setUserId(event.userId());

    if (event.fullName() != null) patient.setName(event.fullName());
    if (event.phoneNumber() != null) patient.setPhoneNumber(event.phoneNumber());
    if (event.cpf() != null) patient.setCpf(event.cpf());

    repository.save(patient);
  }
}