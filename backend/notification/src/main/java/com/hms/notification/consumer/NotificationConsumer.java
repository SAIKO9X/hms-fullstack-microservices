package com.hms.notification.consumer;

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
  public void handleAppointmentReminder(AppointmentEvent event) {
    log.info("Processando lembrete para consulta ID: {}", event.appointmentId());

    String formattedDate = event.appointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm"));
    String shortTime = event.appointmentDateTime().format(DateTimeFormatter.ofPattern("HH:mm"));

    String subject = "Lembrete de Consulta";
    String body = String.format("Olá %s, lembrete da consulta com Dr(a). %s em %s.",
      event.patientName(), event.doctorName(), formattedDate);
    emailService.sendEmail(event.patientEmail(), subject, body);

    saveInAppNotification(
      event.patientId(),
      "Consulta Amanhã",
      "Consulta com Dr(a). " + event.doctorName() + " às " + shortTime,
      NotificationType.APPOINTMENT_REMINDER
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.queues.notification-status:notification.status.queue}")
  public void handleStatusChange(AppointmentStatusChangedEvent event) {
    String formattedDate = event.appointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

    processPatientStatusNotification(event, formattedDate);

    if (event.triggeredByPatient() && event.doctorId() != null) {
      processDoctorStatusNotification(event, formattedDate);
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
      saveInAppNotification(event.patientId(), title, message, NotificationType.STATUS_CHANGE);
    }
  }

  @RabbitListener(queues = RabbitMQConfig.WAITLIST_QUEUE)
  public void handleWaitlistNotification(WaitlistNotificationEvent event) {
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
  public void handlePrescriptionIssued(PrescriptionIssuedEvent event) {
    log.info("Nova receita para paciente ID: {}", event.patientId());

    // email
    String subject = "Nova Receita Médica";
    String body = String.format("<p>Olá %s, o Dr(a). %s emitiu uma nova receita digital.</p>",
      event.patientName(), event.doctorName());
    emailService.sendEmail(event.patientEmail(), subject, body);

    // in-App
    saveInAppNotification(
      event.patientId(),
      "Nova Receita",
      "Dr(a). " + event.doctorName() + " emitiu uma receita. Acesse 'Meus Medicamentos'.",
      NotificationType.PRESCRIPTION
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.lab-queue-name:notification.lab.completed.queue}")
  public void handleLabResult(LabOrderCompletedEvent event) {
    log.info("Resultado de exame pronto. Pedido: {}", event.labOrderNumber());

    // notificar Médico
    if (event.doctorEmail() != null) {
      sendLabResultEmailToDoctor(event);
      saveInAppNotification(event.doctorId(),
        "Exame Pronto",
        "Resultado disponível do paciente: " + event.patientName(),
        NotificationType.LAB_RESULT);
    }

    // notificar Paciente
    if (event.patientId() != null) {
      saveInAppNotification(
        event.patientId(),
        "Exame Concluído",
        "Os resultados do pedido " + event.labOrderNumber() + " estão disponíveis.",
        NotificationType.LAB_RESULT
      );
    }
  }

  @RabbitListener(queues = "${application.rabbitmq.queues.chat-notification:notification.chat.queue}")
  public void handleNewChatMessage(ChatMessageEvent event) {
    saveInAppNotification(
      event.recipientId(),
      "Nova Mensagem de " + event.senderName(),
      event.content(),
      NotificationType.NEW_MESSAGE
    );
  }

  @RabbitListener(queues = "${application.rabbitmq.user-created-queue}")
  public void consumeUserCreated(UserCreatedEvent event) {
    String subject = "Bem-vindo ao HMS";
    String content = String.format("<h1>Código: %s</h1><p>Use este código para ativar sua conta.</p>", event.verificationCode());
    emailService.sendEmail(event.email(), subject, content);
  }

  @RabbitListener(queues = RabbitMQConfig.STOCK_LOW_QUEUE)
  public void handleLowStockEvent(StockLowEvent event) {
    log.info("Recebido alerta de stock baixo para o medicamento: {}", event.medicineName());

    Notification notification = new Notification();
    notification.setRecipientId("ADMIN");
    notification.setTitle("Alerta de Stock Baixo");
    notification.setMessage(String.format("O medicamento %s atingiu níveis críticos. Restam apenas %d unidades (Limite: %d).",
      event.medicineName(), event.currentQuantity(), event.threshold()));
    notification.setType(NotificationType.LOW_STOCK);

    notificationService.sendNotification(notification);
  }

  // método auxiliar atualizado para receber String ou Long convertido
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

  // método auxiliar para processar notificação ao médico
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
      saveInAppNotification(event.doctorId(), title, message, NotificationType.SYSTEM_ALERT);
    }
  }

  // método auxiliar para enviar email ao médico com resultado de exame
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

  // sobrecarga para Long userid
  private void saveInAppNotification(Long userId, String title, String message, NotificationType type) {
    saveInAppNotification(String.valueOf(userId), title, message, type);
  }
}