package com.hms.notification.consumer;

import com.hms.notification.dto.request.EmailRequest;
import com.hms.notification.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

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
}