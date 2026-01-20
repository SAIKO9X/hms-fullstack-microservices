package com.hms.appointment.config;

import lombok.Getter;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

  @Getter
  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  // Fila de Médicos
  public static final String DOCTOR_QUEUE = "appointment.doctor.sync.queue";
  public static final String DOCTOR_ROUTING_KEY = "doctor.*";

  // Fila de Pacientes
  public static final String PATIENT_QUEUE = "appointment.patient.sync.queue";
  public static final String PATIENT_ROUTING_KEY = "patient.*";

  // Fila de Users
  public static final String USER_SYNC_QUEUE = "appointment.user.sync.queue";
  public static final String USER_ROUTING_KEY = "user.event.created";

  // Routing Key para envio de status
  @Value("${application.rabbitmq.appointment-status-routing-key:appointment.status.changed}")
  private String appointmentStatusRoutingKey;

  public static final String DELAYED_EXCHANGE = "delayed.exchange";
  public static final String REMINDER_ROUTING_KEY = "appointment.reminder";
  public static final String WAITLIST_ROUTING_KEY = "appointment.waitlist.available";
  public static final String LAB_COMPLETED_QUEUE = "notification.lab.completed.queue";
  public static final String LAB_RESULT_ROUTING_KEY = "notification.lab.completed";

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(exchange);
  }

  @Bean
  public TopicExchange auditExchange() {
    return new TopicExchange("hms.audit.exchange");
  }

  @Bean
  public Queue labCompletedQueue() {
    return new Queue(LAB_COMPLETED_QUEUE, true);
  }

  @Bean
  public CustomExchange delayedExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "topic");
    return new CustomExchange(DELAYED_EXCHANGE, "x-delayed-message", true, false, args);
  }

  // --- CONFIGURAÇÃO MÉDICO ---
  @Bean
  public Queue doctorQueue() {
    return new Queue(DOCTOR_QUEUE, true);
  }

  @Bean
  public Binding doctorBinding(Queue doctorQueue, TopicExchange exchange) {
    return BindingBuilder.bind(doctorQueue).to(exchange).with(DOCTOR_ROUTING_KEY);
  }

  // --- CONFIGURAÇÃO PACIENTE ---
  @Bean
  public Queue patientQueue() {
    return new Queue(PATIENT_QUEUE, true);
  }

  @Bean
  public Binding patientBinding(Queue patientQueue, TopicExchange exchange) {
    return BindingBuilder.bind(patientQueue).to(exchange).with(PATIENT_ROUTING_KEY);
  }

  @Bean
  public Binding labCompletedBinding(Queue labCompletedQueue, TopicExchange exchange) {
    return BindingBuilder
      .bind(labCompletedQueue)
      .to(exchange)
      .with("notification.lab.completed");
  }

  // --- CONFIGURAÇÃO USER ---
  @Bean
  public Queue userSyncQueue() {
    return new Queue(USER_SYNC_QUEUE, true);
  }

  @Bean
  public Binding userBinding() {
    return BindingBuilder.bind(userSyncQueue()).to(exchange()).with(USER_ROUTING_KEY);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(jsonMessageConverter());
    return rabbitTemplate;
  }
}