package com.hms.appointment.listener;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.PrescriptionDispensedEvent;
import com.hms.appointment.services.PrescriptionService;
import com.hms.common.dto.event.EventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PrescriptionEventListener {

  private final PrescriptionService prescriptionService;

  @RabbitListener(queues = RabbitMQConfig.PRESCRIPTION_DISPENSED_QUEUE)
  public void handlePrescriptionDispensed(EventEnvelope<PrescriptionDispensedEvent> envelope) {
    try {
      PrescriptionDispensedEvent event = envelope.getPayload();
      log.info("Recebido envelope de receita aviada [Correlation: {}]", envelope.getCorrelationId());

      prescriptionService.markAsDispensed(event.prescriptionId());
    } catch (Exception e) {
      log.error("Erro ao processar receita aviada. Descartando mensagem.", e);
    }
  }
}