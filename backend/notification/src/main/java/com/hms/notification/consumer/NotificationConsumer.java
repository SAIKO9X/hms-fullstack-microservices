package com.hms.notification.consumer;

import com.hms.notification.config.RabbitMQConfig;
import com.hms.notification.dto.event.AppointmentEvent;
import com.hms.notification.dto.event.AppointmentStatusChangedEvent;
import com.hms.notification.dto.event.WaitlistNotificationEvent;
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

  @RabbitListener(queues = RabbitMQConfig.REMINDER_QUEUE)
  public void handleAppointmentReminder(AppointmentEvent event) {
    log.info("Processando lembrete de consulta para: {}", event.patientEmail());

    String subject = "Lembrete: Sua consulta é amanhã!";
    String content = String.format("""
      <h1>Lembrete de Consulta</h1>
      <p>Olá,</p>
      <p>Este é um lembrete de que você tem uma consulta agendada com <b>Dr. %s</b> em <b>%s</b>.</p>
      <p>Por favor, chegue com 15 minutos de antecedência.</p>
      """, event.doctorName(), event.appointmentDateTime());
  }

  @RabbitListener(queues = RabbitMQConfig.WAITLIST_QUEUE)
  public void handleWaitlistNotification(WaitlistNotificationEvent event) {
    log.info("Notificando paciente da fila de espera: {}", event.email());

    String subject = "Vaga Disponível com Dr. " + event.doctorName();
    String content = String.format("""
      <h1>Boa Notícia!</h1>
      <p>Olá %s,</p>
      <p>Surgiu uma vaga com <b>Dr. %s</b> para o dia <b>%s</b>.</p>
      <p>Acesse o sistema agora para confirmar este horário antes que seja ocupado.</p>
      """, event.patientName(), event.doctorName(), event.availableDateTime());
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