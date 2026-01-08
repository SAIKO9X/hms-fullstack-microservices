package com.hms.notification.consumer;

import com.hms.notification.config.RabbitMQConfig;
import com.hms.notification.dto.event.AppointmentStatusChangedEvent;
import com.hms.notification.dto.request.EmailRequest;
import com.hms.notification.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationConsumer {

  private final EmailService emailService;

  @RabbitListener(queues = "${application.rabbitmq.notification-queue}")
  public void consumeNotification(EmailRequest request) {
    log.info("Mensagem recebida da fila: {}", request);

    emailService.sendEmail(
      request.to(),
      request.subject(),
      request.body()
    );
  }

  @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_NOTIFICATION_QUEUE)
  public void consumeAppointmentEvent(AppointmentStatusChangedEvent event) {
    log.info("Processando notificação de agendamento: Status {}", event.status());

    if (event.patientEmail() == null || event.patientEmail().isBlank()) {
      log.warn("E-mail do paciente não fornecido no evento. Notificação cancelada.");
      return;
    }

    String subject;
    String body;
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    String formattedDate = event.appointmentDate().format(formatter);

    switch (event.status()) {
      case "SCHEDULED":
        subject = "Confirmação de Consulta - HMS";
        body = String.format("<h1>Consulta Confirmada</h1><p>Olá %s,</p><p>Sua consulta com <strong>Dr(a). %s</strong> está agendada para: <strong>%s</strong>.</p>",
          event.patientName(), event.doctorName(), formattedDate);
        break;
      case "CANCELED":
        subject = "Cancelamento de Consulta - HMS";
        body = String.format("<h1>Consulta Cancelada</h1><p>Olá %s,</p><p>Sua consulta com <strong>Dr(a). %s</strong> para o dia %s foi cancelada.</p>",
          event.patientName(), event.doctorName(), formattedDate);
        break;
      case "RESCHEDULED":
        subject = "Consulta Remarcada - HMS";
        body = String.format("<h1>Consulta Remarcada</h1><p>Olá %s,</p><p>Sua consulta com <strong>Dr(a). %s</strong> foi alterada para: <strong>%s</strong>.</p>",
          event.patientName(), event.doctorName(), formattedDate);
        break;
      default:
        return;
    }

    emailService.sendEmail(
      event.patientEmail(),
      subject,
      body
    );
  }
}