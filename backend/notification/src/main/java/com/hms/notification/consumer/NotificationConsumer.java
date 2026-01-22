package com.hms.notification.consumer;

import com.hms.notification.config.RabbitMQConfig;
import com.hms.notification.dto.event.*;
import com.hms.notification.dto.request.EmailRequest;
import com.hms.notification.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

  private final JavaMailSender mailSender;
  private final EmailService emailService;
  private final SpringTemplateEngine templateEngine;

  // notificação genérica de e-mail
  @RabbitListener(queues = "${application.rabbitmq.notification-queue}")
  public void consumeNotification(EmailRequest request) {
    log.info("Mensagem recebida da fila: {}", request);
    emailService.sendEmail(request.to(), request.subject(), request.body());
  }

  // Lembrete de consulta (24h ou 1h antes)
  @RabbitListener(queues = "${application.rabbitmq.queues.notification-reminder:notification.reminder.queue}")
  public void handleAppointmentReminder(AppointmentEvent event) {
    log.info("Lembrete recebido para paciente: {}", event.patientEmail());

    String subject = "Lembrete de Consulta - HMS";
    String formattedDate = event.appointmentDateTime()
      .format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));
    String body = String.format(
      "Olá, este é um lembrete da sua consulta com Dr(a). %s agendada para %s. Por favor, chegue com 15 minutos de antecedência.",
      event.doctorName(),
      formattedDate
    );

    emailService.sendEmail(event.patientEmail(), subject, body);
  }

  // Notificação de mudança de status da consulta
  @RabbitListener(queues = "${application.rabbitmq.queues.notification-status:notification.status.queue}")
  public void handleStatusChange(AppointmentStatusChangedEvent event) {
    log.info("Evento de status recebido: {} -> {}", event.appointmentId(), event.newStatus());

    if (event.patientEmail() == null || event.patientEmail().isBlank()) {
      log.warn("E-mail do paciente ausente. Ignorando notificação.");
      return;
    }

    String formattedDate = event.appointmentDateTime()
      .format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));

    String subject = "Atualização da Consulta - HMS";
    String body = "";

    switch (event.newStatus()) {
      case "CANCELED":
        subject = "Consulta Cancelada";
        body = String.format("<h1>Consulta Cancelada</h1><p>Olá %s,</p><p>Sua consulta com <strong>Dr(a). %s</strong> para o dia %s foi cancelada.</p>",
          event.patientName(), event.doctorName(), formattedDate);
        break;
      case "RESCHEDULED":
        subject = "Consulta Reagendada";
        body = String.format("<h1>Consulta Remarcada</h1><p>Olá %s,</p><p>Sua consulta com <strong>Dr(a). %s</strong> foi alterada para: <strong>%s</strong>.</p>",
          event.patientName(), event.doctorName(), formattedDate);
        break;
      case "COMPLETED":
        subject = "Consulta Concluída";
        body = String.format("<h1>Consulta Concluída</h1><p>Olá %s,</p><p>Sua consulta foi concluída. Acesse o portal para ver sua prescrição e avaliar o atendimento.</p>",
          event.patientName());
        break;
      case "SCHEDULED":
        subject = "Confirmação de Agendamento";
        body = String.format("<h1>Consulta Confirmada</h1><p>Olá %s,</p><p>Sua consulta com <strong>Dr(a). %s</strong> está agendada para: <strong>%s</strong>.</p>",
          event.patientName(), event.doctorName(), formattedDate);
        break;
      default:
        return; // ignora status desconhecidos
    }

    emailService.sendEmail(event.patientEmail(), subject, body);
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

    emailService.sendEmail(event.email(), subject, content);
  }

  @RabbitListener(queues = "${application.rabbitmq.user-created-queue}")
  public void consumeUserCreated(UserCreatedEvent event) {
    log.info("Novo usuário criado. Enviando código para: {}", event.email());

    String subject = "Confirme sua conta - HMS";
    String content = String.format("""
      <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Bem-vindo ao HMS, %s!</h2>
          <p>Obrigado por se cadastrar. Use o código abaixo para ativar sua conta:</p>
          <h1 style="color: #2563eb; letter-spacing: 5px;">%s</h1>
          <p>Este código expira em 15 minutos.</p>
      </div>
      """, event.name(), event.verificationCode());

    emailService.sendEmail(event.email(), subject, content);
  }

  @RabbitListener(queues = "${application.rabbitmq.lab-queue-name:notification.lab.completed.queue}")
  public void handleLabResult(LabOrderCompletedEvent event) {
    log.info("Processando notificação de exame: ID Pedido {}", event.labOrderNumber());

    String doctorEmail = event.doctorEmail();

    if (doctorEmail == null || doctorEmail.isBlank()) {
      log.warn("Email ausente no evento para o pedido {}", event.labOrderNumber());
      return;
    }

    try {
      Context context = new Context();
      context.setVariables(Map.of(
        "doctorName", event.doctorName(),
        "patientName", event.patientName(),
        "orderNumber", event.labOrderNumber(),
        "orderDate", event.completionDate(),
        "actionUrl", event.resultUrl()
      ));

      String htmlBody = templateEngine.process("lab-result-email", context);

      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

      helper.setTo(doctorEmail);
      helper.setSubject("Resultados de Exames Disponíveis - Pedido " + event.labOrderNumber());
      helper.setText(htmlBody, true);
      helper.setFrom("no-reply@hms.com");

      mailSender.send(message);
      log.info("Email enviado para {}", doctorEmail);

    } catch (MessagingException e) {
      log.error("Erro ao enviar email", e);
    }
  }
}