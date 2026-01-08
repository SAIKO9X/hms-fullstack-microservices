package com.hms.appointment.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  public static final String EXCHANGE_NAME = "hms.exchange";

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

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(EXCHANGE_NAME);
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