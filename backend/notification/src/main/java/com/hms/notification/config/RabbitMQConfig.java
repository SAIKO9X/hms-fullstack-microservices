package com.hms.notification.config;

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

  @Value("${application.rabbitmq.notification-queue}")
  private String notificationQueue;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.routing-key}")
  private String routingKey;

  public static final String APPOINTMENT_NOTIFICATION_QUEUE = "notification.appointment.queue";

  @Bean
  public Queue appointmentNotificationQueue() {
    return new Queue(APPOINTMENT_NOTIFICATION_QUEUE, true);
  }

  @Bean
  public Binding appointmentBinding(TopicExchange exchange) {
    return BindingBuilder.bind(appointmentNotificationQueue())
      .to(exchange)
      .with("appointment.status.changed");
  }

  @Bean
  public Queue notificationQueue() {
    return new Queue(notificationQueue, true);
  }

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(exchange);
  }

  @Bean
  public Binding binding(Queue queue, TopicExchange exchange) {
    return BindingBuilder
      .bind(queue)
      .to(exchange)
      .with(routingKey);
  }

  @Bean
  public MessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
    final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(jsonMessageConverter());
    return rabbitTemplate;
  }
}