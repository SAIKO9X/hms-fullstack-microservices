package com.hms.billing.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.billing.config.RabbitMQConfig;
import com.hms.billing.dto.event.AppointmentStatusChangedEvent;
import com.hms.billing.dto.event.PharmacySaleCreatedEvent;
import com.hms.billing.entities.Invoice;
import com.hms.billing.enums.InvoiceStatus;
import com.hms.billing.repositories.InvoiceRepository;
import com.hms.billing.services.BillingService;
import com.hms.common.dto.event.EventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillingEventListener {

  private final BillingService billingService;
  private final InvoiceRepository invoiceRepository;
  private final ObjectMapper objectMapper;

  @RabbitListener(queues = "${application.rabbitmq.queues.appointment-billing}")
  public void handleAppointmentStatusChange(@Payload EventEnvelope<?> envelope) {
    AppointmentStatusChangedEvent event = objectMapper.convertValue(envelope.getPayload(), AppointmentStatusChangedEvent.class);

    if (event == null || event.appointmentId() == null) return;

    log.info("Evento recebido no Billing: Consulta {} está {}", event.appointmentId(), event.status());

    if ("COMPLETED".equals(event.status())) {
      billingService.generateInvoiceForAppointment(
        event.appointmentId(),
        String.valueOf(event.patientId()),
        String.valueOf(event.doctorId())
      );
    }
  }

  @RabbitListener(queues = RabbitMQConfig.BILLING_PHARMACY_QUEUE)
  @Transactional
  public void handlePharmacySale(@Payload EventEnvelope<?> envelope) {
    PharmacySaleCreatedEvent event = objectMapper.convertValue(envelope.getPayload(), PharmacySaleCreatedEvent.class);

    if (event == null || event.saleId() == null) return;

    log.info("Recebido evento de venda da farmácia: {}", event);

    if (invoiceRepository.findByPharmacySaleId(event.saleId()).isPresent()) {
      log.warn("Fatura já existente para Venda Farmácia ID {}", event.saleId());
      return;
    }

    Invoice invoice = new Invoice();
    invoice.setPharmacySaleId(event.saleId());
    invoice.setPatientId(String.valueOf(event.patientId()));
    invoice.setTotalAmount(event.totalAmount());
    invoice.setPatientPayable(event.totalAmount());
    invoice.setInsuranceCovered(BigDecimal.ZERO);
    invoice.setStatus(InvoiceStatus.PAID);
    invoice.setPatientPaidAt(event.saleDate());
    invoice.setPaidAt(LocalDateTime.now());
    invoiceRepository.save(invoice);
    log.info("Fatura de Farmácia criada com sucesso: Invoice ID {}", invoice.getId());
  }
}