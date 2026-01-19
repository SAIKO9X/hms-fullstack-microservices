package com.hms.appointment.listener;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.DoctorEvent;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DoctorEventListener {

  private final DoctorReadModelRepository repository;

  @RabbitListener(queues = RabbitMQConfig.DOCTOR_QUEUE)
  public void handleDoctorEvent(DoctorEvent event) {
    log.info("Recebido evento de médico: {} - {}", event.eventType(), event.fullName());

    DoctorReadModel doctor = new DoctorReadModel(
      event.doctorId(),
      event.userId(),
      event.fullName(),
      event.specialization(),
      null
    );

    repository.save(doctor);
    log.info("Modelo de leitura do médico atualizado com sucesso.");
  }
}