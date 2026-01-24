package com.hms.notification.config;

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

  @Value("${application.rabbitmq.notification-queue}")
  private String notificationQueue;

  @Value("${application.rabbitmq.user-created-queue}")
  private String userCreatedQueue;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.routing-key}")
  private String routingKey;

  @Value("${application.rabbitmq.user-created-routing-key:user.event.created}")
  private String userCreatedRoutingKey;

  public static final String APPOINTMENT_NOTIFICATION_QUEUE = "notification.appointment.queue";
  public static final String NOTIFICATION_STATUS_QUEUE = "notification.status.queue";
  public static final String LAB_COMPLETED_QUEUE = "notification.lab.completed.queue";
  public static final String REMINDER_QUEUE = "notification.reminder.queue";
  public static final String WAITLIST_QUEUE = "notification.waitlist.queue";
  public static final String DELAYED_EXCHANGE = "delayed.exchange";

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(exchange);
  }

  @Bean
  public Queue notificationStatusQueue() {
    return new Queue(NOTIFICATION_STATUS_QUEUE, true);
  }

  @Bean
  public Binding notificationStatusBinding(Queue notificationStatusQueue, TopicExchange exchange) {
    return BindingBuilder
      .bind(notificationStatusQueue)
      .to(exchange)
      .with("notification.status.#");
  }

  @Bean
  public CustomExchange delayedExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "topic");
    return new CustomExchange(DELAYED_EXCHANGE, "x-delayed-message", true, false, args);
  }

  @Bean
  public Queue userCreatedQueue() {
    return new Queue(userCreatedQueue, true);
  }

  @Bean
  public Queue labCompletedQueue() {
    return new Queue(LAB_COMPLETED_QUEUE, true);
  }

  @Bean
  public Queue notificationQueue() {
    return new Queue(notificationQueue, true);
  }

  @Bean
  public Queue appointmentNotificationQueue() {
    return new Queue(APPOINTMENT_NOTIFICATION_QUEUE, true);
  }

  @Bean
  public Queue reminderQueue() {
    return new Queue(REMINDER_QUEUE, true);
  }

  @Bean
  public Queue waitlistQueue() {
    return new Queue(WAITLIST_QUEUE, true);
  }

  @Bean
  public Binding userCreatedBinding(TopicExchange exchange) {
    return BindingBuilder.bind(userCreatedQueue())
      .to(exchange)
      .with(userCreatedRoutingKey);
  }

  @Bean
  public Binding binding(Queue notificationQueue, TopicExchange exchange) {
    return BindingBuilder.bind(notificationQueue).to(exchange).with(routingKey);
  }

  @Bean
  public Binding appointmentBinding(TopicExchange exchange) {
    return BindingBuilder.bind(appointmentNotificationQueue())
      .to(exchange)
      .with("appointment.status.changed");
  }

  @Bean
  public Binding labCompletedBinding(Queue labCompletedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(labCompletedQueue)
      .to(exchange)
      .with("notification.lab.completed");
  }

  @Bean
  public Binding delayedReminderBinding() {
    return BindingBuilder.bind(reminderQueue())
      .to(delayedExchange())
      .with("appointment.reminder")
      .noargs();
  }

  @Bean
  public Binding waitlistBinding() {
    return BindingBuilder.bind(waitlistQueue())
      .to(exchange())
      .with("appointment.waitlist.available");
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