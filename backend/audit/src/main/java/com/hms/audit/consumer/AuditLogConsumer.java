package com.hms.audit.consumer;

import com.hms.audit.entities.AuditLog;
import com.hms.audit.repositories.AuditLogRepository;
import com.hms.common.dto.AuditLogEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Configuration
@RequiredArgsConstructor
public class AuditLogConsumer {

  private final AuditLogRepository repository;

  @Bean
  public Queue auditQueue() {
    return new Queue("audit.queue", true);
  }

  @Bean
  public TopicExchange auditExchange() {
    return new TopicExchange("hms.audit.exchange");
  }

  @Bean
  public Binding binding(Queue auditQueue, TopicExchange auditExchange) {
    return BindingBuilder.bind(auditQueue).to(auditExchange).with("audit.#");
  }

  @RabbitListener(queues = "audit.queue")
  public void receiveAuditLog(AuditLogEvent event) {
    log.info("Received Audit Log: {} - {} by {}", event.action(), event.resourceName(), event.actorId());

    try {
      AuditLog auditLog = AuditLog.builder()
        .actorId(event.actorId())
        .actorRole(event.actorRole())
        .action(event.action())
        .resourceName(event.resourceName())
        .resourceId(event.resourceId())
        .details(event.details())
        .ipAddress(event.ipAddress())
        .timestamp(event.timestamp())
        .build();

      repository.save(auditLog);

    } catch (Exception e) {
      log.error("Error saving audit log", e);
    }
  }
}