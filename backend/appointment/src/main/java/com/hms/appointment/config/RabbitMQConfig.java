package com.hms.appointment.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
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

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }
}