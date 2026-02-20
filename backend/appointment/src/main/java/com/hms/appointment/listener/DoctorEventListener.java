package com.hms.appointment.listener;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.DoctorEvent;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.common.dto.event.EventEnvelope;
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
  public void handleDoctorEvent(EventEnvelope<DoctorEvent> envelope) {
    try {
      DoctorEvent event = envelope.getPayload();
      log.info("Recebido envelope médico: {} - DoctorId: {}", event.eventType(), event.doctorId());

      if (event.doctorId() == null) {
        log.warn("Evento médico ignorado: doctorId está NULO. Impossível salvar sem ID.");
        return;
      }

      DoctorReadModel doctor = repository.findById(event.doctorId())
        .orElseGet(() -> {
          DoctorReadModel newDoctor = new DoctorReadModel();
          newDoctor.setDoctorId(event.doctorId());
          return newDoctor;
        });

      // atualiza apenas o que veio no evento
      if (event.userId() != null) doctor.setUserId(event.userId());
      if (event.fullName() != null) doctor.setFullName(event.fullName());
      if (event.specialization() != null) doctor.setSpecialization(event.specialization());

      repository.save(doctor);
      log.info("DoctorReadModel salvo/atualizado com sucesso! ID: {}", doctor.getDoctorId());

    } catch (Exception e) {
      log.error("Erro ao processar DoctorEvent. Descartando mensagem para evitar loop: {}", e.getMessage(), e);
    }
  }
}