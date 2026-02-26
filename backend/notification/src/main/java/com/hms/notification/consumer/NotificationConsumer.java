package com.hms.notification.consumer;

import com.hms.common.dto.event.EventEnvelope;
import com.hms.notification.config.RabbitMQConfig;
import com.hms.notification.dto.event.*;
import com.hms.notification.dto.request.EmailRequest;
import com.hms.notification.entities.Notification;
import com.hms.notification.enums.NotificationType;
import com.hms.notification.services.EmailService;
import com.hms.notification.services.NotificationService;
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
  private final NotificationService notificationService;

  @RabbitListener(queues = "${application.rabbitmq.notification-queue}")
  public void consumeGenericEmail(EmailRequest request) {
    log.info("Email genérico para: {}", request.to());
    emailService.sendEmail(request.to(), request.subject(), request.body());
  }

  @RabbitListener(queues = "${application.rabbitmq.queues.notification-reminder:notification.reminder.queue}")
  public void handleAppointmentReminder(EventEnvelope<AppointmentEvent> envelope) {
    AppointmentEvent event = envelope.getPayload();
    log.info("Processando lembrete [Evento ID: {}] para consulta ID: {}", envelope.getEventId(), event.appointmentId());

    String formattedDate = event.appointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));
    String shortTime = event.appointmentDateTime().format(DateTimeFormatter.ofPattern("HH:mm"));

    String subject = "Lembrete de Consulta";
    String body = String.format("Olá %s, lembrete da consulta com Dr(a). %s em %s.",
      event.patientName(), event.doctorName(), formattedDate);

    if (event.patientEmail() != null && !event.patientEmail().isBlank()) {
      try {
        emailService.sendEmail(event.patientEmail(), subject, body);
      } catch (Exception e) {
        log.error("Erro ao enviar email de lembrete para {}", event.patientEmail(), e);
      }
    } else {
      log.warn("E-mail não fornecido para o paciente {}. Pulando envio de e-mail de lembrete.", event.patientId());
    }

    saveInAppNotification(
      event.patientId(),
      "Consulta Amanhã",
      "Consulta com Dr(a). " + event.doctorName() + " às " + shortTime,
      NotificationType.APPOINTMENT_REMINDER
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.queues.notification-status:notification.status.queue}")
  public void handleStatusChange(EventEnvelope<AppointmentStatusChangedEvent> envelope) {
    AppointmentStatusChangedEvent event = envelope.getPayload();
    String formattedDate = event.appointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

    processPatientStatusNotification(event, formattedDate);

    if (event.triggeredByPatient() && event.doctorId() != null) {
      processDoctorStatusNotification(event, formattedDate);
    }
  }

  @RabbitListener(queues = RabbitMQConfig.WAITLIST_QUEUE)
  public void handleWaitlistNotification(EventEnvelope<WaitlistNotificationEvent> envelope) {
    WaitlistNotificationEvent event = envelope.getPayload();

    // email
    String content = "Surgiu uma vaga com Dr. " + event.doctorName() + " em " + event.availableDateTime();
    emailService.sendEmail(event.email(), "Vaga Disponível!", content);

    // in-App
    saveInAppNotification(
      event.userId(),
      "Vaga na Lista de Espera!",
      "Uma vaga surgiu para " + event.availableDateTime() + ". Acesse para agendar.",
      NotificationType.WAITLIST_ALERT
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.queues.notification-prescription:notification.prescription.queue}")
  public void handlePrescriptionIssued(EventEnvelope<PrescriptionIssuedEvent> envelope) {
    PrescriptionIssuedEvent event = envelope.getPayload();
    log.info("Nova receita [Correlation: {}] para paciente ID: {} (UserID: {})",
      envelope.getCorrelationId(), event.patientId(), event.patientUserId());

    if (event.patientEmail() != null && !event.patientEmail().isBlank()) {
      try {
        String subject = "Nova Receita Médica";
        String body = String.format("<p>Olá %s, o Dr(a). %s emitiu uma nova receita digital.</p>",
          event.patientName(), event.doctorName());
        emailService.sendEmail(event.patientEmail(), subject, body);
      } catch (Exception e) {
        log.error("Erro ao enviar email de nova receita para o paciente {}", event.patientEmail(), e);
      }
    } else {
      log.warn("E-mail não fornecido para o paciente {}. Pulando envio de e-mail.", event.patientId());
    }

    Long recipientId = event.patientUserId() != null ? event.patientUserId() : event.patientId();

    saveInAppNotification(
      recipientId,
      "Nova Receita",
      "Dr(a). " + event.doctorName() + " emitiu uma receita. Acesse 'Meus Medicamentos'.",
      NotificationType.PRESCRIPTION
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.lab-queue-name:notification.lab.completed.queue}")
  public void handleLabResult(EventEnvelope<LabOrderCompletedEvent> envelope) {
    LabOrderCompletedEvent event = envelope.getPayload();
    log.info("Resultado de exame pronto. Pedido: {}", event.labOrderNumber());

    // notificar Médico
    if (event.doctorEmail() != null) {
      sendLabResultEmailToDoctor(event);

      // Usa o doctorUserId se disponível, senão fallback para doctorId
      Long docRecipientId = event.doctorUserId() != null ? event.doctorUserId() : event.doctorId();

      saveInAppNotification(docRecipientId,
        "Exame Pronto",
        "Resultado disponível do paciente: " + event.patientName(),
        NotificationType.LAB_RESULT);
    }

    // notificar Paciente
    if (event.patientId() != null) {
      // Usa o patientUserId se disponível, senão fallback para patientId
      Long patRecipientId = event.patientUserId() != null ? event.patientUserId() : event.patientId();

      saveInAppNotification(
        patRecipientId,
        "Exame Concluído",
        "Os resultados do pedido " + event.labOrderNumber() + " estão disponíveis.",
        NotificationType.LAB_RESULT
      );
    }
  }

  private void processPatientStatusNotification(AppointmentStatusChangedEvent event, String formattedDate) {
    String title = "";
    String message = "";

    switch (event.newStatus()) {
      case "CANCELED" -> {
        title = "Consulta Cancelada";
        message = "A consulta com Dr(a). " + event.doctorName() + " foi cancelada.";
      }
      case "RESCHEDULED" -> {
        title = "Consulta Reagendada";
        message = "Sua consulta mudou para " + formattedDate;
      }
      case "COMPLETED" -> {
        title = "Consulta Finalizada";
        message = "Consulta concluída. Toque para avaliar seu atendimento.";
      }
      case "SCHEDULED" -> {
        title = "Agendamento Confirmado";
        message = "Consulta confirmada para " + formattedDate;
      }
    }

    if (!title.isEmpty()) {
      Long recipientId = event.patientUserId() != null ? event.patientUserId() : event.patientId();
      saveInAppNotification(recipientId, title, message, NotificationType.STATUS_CHANGE);
    }
  }

  private void processDoctorStatusNotification(AppointmentStatusChangedEvent event, String formattedDate) {
    String title = "";
    String message = "";

    switch (event.newStatus()) {
      case "CANCELED" -> {
        title = "Cancelamento de Paciente";
        message = "O paciente " + event.patientName() + " cancelou a consulta de " + formattedDate;
      }
      case "RESCHEDULED" -> {
        title = "Reagendamento de Paciente";
        message = "O paciente " + event.patientName() + " solicitou reagendamento para " + formattedDate;
      }
    }

    if (!title.isEmpty()) {
      Long recipientId = event.doctorUserId() != null ? event.doctorUserId() : event.doctorId();
      saveInAppNotification(recipientId, title, message, NotificationType.SYSTEM_ALERT);
    }
  }

  @RabbitListener(queues = "${application.rabbitmq.queues.chat-notification:notification.chat.queue}")
  public void handleNewChatMessage(EventEnvelope<ChatMessageEvent> envelope) {
    ChatMessageEvent event = envelope.getPayload();
    saveInAppNotification(
      event.recipientId(),
      "Nova Mensagem de " + event.senderName(),
      event.content(),
      NotificationType.NEW_MESSAGE
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.user-created-queue}")
  public void consumeUserCreated(EventEnvelope<UserCreatedEvent> envelope) {
    UserCreatedEvent event = envelope.getPayload();
    String subject = "Bem-vindo ao HMS";
    String content = String.format("<h1>Código: %s</h1><p>Use este código para ativar sua conta.</p>", event.verificationCode());
    emailService.sendEmail(event.email(), subject, content);
  }

  @RabbitListener(queues = RabbitMQConfig.STOCK_LOW_QUEUE)
  public void handleLowStockEvent(EventEnvelope<StockLowEvent> envelope) {
    StockLowEvent event = envelope.getPayload();
    log.info("Recebido alerta de stock baixo para o medicamento: {}", event.medicineName());

    Notification notification = new Notification();
    notification.setRecipientId("ADMIN");
    notification.setTitle("Alerta de Stock Baixo");
    notification.setMessage(String.format("O medicamento %s atingiu níveis críticos. Restam apenas %d unidades (Limite: %d).",
      event.medicineName(), event.currentQuantity(), event.threshold()));
    notification.setType(NotificationType.LOW_STOCK);

    notificationService.sendNotification(notification);
  }

  @RabbitListener(bindings = @org.springframework.amqp.rabbit.annotation.QueueBinding(
    value = @org.springframework.amqp.rabbit.annotation.Queue(value = "${application.rabbitmq.notification-review:notification.review.queue}", durable = "true"),
    exchange = @org.springframework.amqp.rabbit.annotation.Exchange(value = "internal.exchange", type = "topic"),
    key = "notification.review.alert"
  ))
  public void handleNewReview(EventEnvelope<ReviewNotificationEvent> envelope) {
    ReviewNotificationEvent event = envelope.getPayload();
    log.info("Nova avaliação recebida para médico ID: {}", event.doctorId());

    String message = String.format("O paciente %s avaliou seu atendimento com %d estrela(s).", event.patientName(), event.rating());
    if (event.comment() != null && !event.comment().isBlank()) {
      message += " Comentário: \"" + event.comment() + "\"";
    }

    saveInAppNotification(
      event.doctorId(),
      "Nova Avaliação Recebida",
      message,
      NotificationType.NEW_REVIEW
    );
  }

  private void saveInAppNotification(String recipientId, String title, String message, NotificationType type) {
    if (recipientId == null) {
      log.warn("Tentativa de salvar notificação sem recipientId. Title: {}", title);
      return;
    }
    try {
      Notification notification = Notification.builder()
        .recipientId(recipientId)
        .title(title)
        .message(message)
        .type(type)
        .build();
      notificationService.sendNotification(notification);
    } catch (Exception e) {
      log.error("Erro ao salvar notificação para {}: {}", recipientId, e.getMessage());
    }
  }

  private void sendLabResultEmailToDoctor(LabOrderCompletedEvent event) {
    try {
      Context context = new Context();
      context.setVariables(Map.of(
        "doctorName", event.doctorName(),
        "patientName", event.patientName(),
        "orderNumber", event.labOrderNumber(),
        "actionUrl", event.resultUrl()
      ));
      String htmlBody = templateEngine.process("lab-result-email", context);

      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
      helper.setTo(event.doctorEmail());
      helper.setSubject("Resultados: Pedido " + event.labOrderNumber());
      helper.setText(htmlBody, true);
      mailSender.send(message);
    } catch (MessagingException e) {
      log.error("Erro email médico", e);
    }
  }

  private void saveInAppNotification(Long userId, String title, String message, NotificationType type) {
    saveInAppNotification(String.valueOf(userId), title, message, type);
  }
}