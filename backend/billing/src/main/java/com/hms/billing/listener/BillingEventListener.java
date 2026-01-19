package com.hms.billing.listener;

import com.hms.billing.dto.event.AppointmentStatusChangedEvent;
import com.hms.billing.services.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillingEventListener {

  private final BillingService billingService;

  @RabbitListener(queues = "${rabbitmq.queues.appointment-billing}")
  public void handleAppointmentStatusChange(AppointmentStatusChangedEvent event) {
    log.info("Evento recebido no Billing: Consulta {} está {}", event.appointmentId(), event.status());

    if ("COMPLETED".equals(event.status())) {
      billingService.generateInvoiceForAppointment(
        event.appointmentId(),
        event.patientId(),
        event.doctorId()
      );
    }
  }
}