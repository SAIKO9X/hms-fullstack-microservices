package com.hms.notification.consumer;

import com.hms.common.dto.event.EventEnvelope;
import com.hms.notification.dto.event.AppointmentStatusChangedEvent;
import com.hms.notification.dto.event.StockLowEvent;
import com.hms.notification.entities.Notification;
import com.hms.notification.enums.NotificationType;
import com.hms.notification.services.EmailService;
import com.hms.notification.services.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {

  @Mock
  private JavaMailSender mailSender;

  @Mock
  private EmailService emailService;

  @Mock
  private SpringTemplateEngine templateEngine;

  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private NotificationConsumer consumer;

  @Captor
  private ArgumentCaptor<Notification> notificationCaptor;

  @Test
  @DisplayName("Deve disparar notificação In-App de estoque baixo para o ADMIN")
  void handleLowStockEvent_ShouldSendAdminNotification() {
    StockLowEvent payload = new StockLowEvent(1L, "Paracetamol 500mg", 5, 20);
    EventEnvelope<StockLowEvent> envelope = new EventEnvelope<>();
    envelope.setPayload(payload);

    consumer.handleLowStockEvent(envelope);

    verify(notificationService).sendNotification(notificationCaptor.capture());
    Notification sentNotification = notificationCaptor.getValue();

    assertEquals("ADMIN", sentNotification.getRecipientId());
    assertEquals("Alerta de Stock Baixo", sentNotification.getTitle());
    assertEquals(NotificationType.LOW_STOCK, sentNotification.getType());
    assertTrue(sentNotification.getMessage().contains("Paracetamol 500mg"));
    assertTrue(sentNotification.getMessage().contains("Restam apenas 5 unidades"));
  }

  @Test
  @DisplayName("Deve enviar notificação para Paciente e Médico quando paciente cancela consulta")
  void handleStatusChange_PatientCanceled_ShouldNotifyBoth() {
    EventEnvelope<AppointmentStatusChangedEvent> envelope = getAppointmentStatusChangedEventEventEnvelope();

    consumer.handleStatusChange(envelope);

    // como o paciente engatilhou e cancelou, espera que sendNotification seja chamado 2 vezes (1 p/ paciente, 1 p/ médico)
    verify(notificationService, times(2)).sendNotification(notificationCaptor.capture());

    var notifications = notificationCaptor.getAllValues();

    // verifica a notificação que foi para o paciente
    Notification patientNotif = notifications.getFirst();
    assertEquals("2000", patientNotif.getRecipientId()); // patientUserId
    assertEquals("Consulta Cancelada", patientNotif.getTitle());
    assertEquals(NotificationType.STATUS_CHANGE, patientNotif.getType());

    // verifica a notificação que foi para o médico (já que triggeredByPatient = true)
    Notification doctorNotif = notifications.get(1);
    assertEquals("3000", doctorNotif.getRecipientId()); // doctorUserId
    assertEquals("Cancelamento de Paciente", doctorNotif.getTitle());
    assertEquals(NotificationType.SYSTEM_ALERT, doctorNotif.getType());
    assertTrue(doctorNotif.getMessage().contains("Maria"));
  }

  private static EventEnvelope<AppointmentStatusChangedEvent> getAppointmentStatusChangedEventEventEnvelope() {
    LocalDateTime appointmentDate = LocalDateTime.of(2026, 12, 1, 14, 30);

    // cria um evento de cancelamento originado pelo paciente
    AppointmentStatusChangedEvent payload = new AppointmentStatusChangedEvent(
      10L,
      200L,
      2000L,
      300L,
      3000L,
      "maria@teste.com",
      "Maria",
      "Dr. House",
      appointmentDate,
      "CANCELED",
      null,
      true
    );
    EventEnvelope<AppointmentStatusChangedEvent> envelope = new EventEnvelope<>();
    envelope.setPayload(payload);
    return envelope;
  }
}