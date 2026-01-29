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

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  public static final String NOTIFICATION_STATUS_QUEUE = "notification.status.queue";
  public static final String LAB_COMPLETED_QUEUE = "notification.lab.completed.queue";
  public static final String REMINDER_QUEUE = "notification.reminder.queue";
  public static final String WAITLIST_QUEUE = "notification.waitlist.queue";
  public static final String APPOINTMENT_NOTIFICATION_QUEUE = "notification.appointment.queue";
  public static final String CHAT_QUEUE = "notification.chat.queue";
  public static final String PRESCRIPTION_QUEUE = "notification.prescription.queue";
  public static final String USER_CREATED_QUEUE = "notification.user.created.queue";
  public static final String STOCK_LOW_QUEUE = "notification.stock.low.queue";

  @Value("${application.rabbitmq.routing-key}")
  private String routingKey;

  public static final String DELAYED_EXCHANGE = "delayed.exchange";

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(exchange);
  }

  @Bean
  public CustomExchange delayedExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "topic");
    return new CustomExchange(DELAYED_EXCHANGE, "x-delayed-message", true, false, args);
  }

  @Bean
  public Queue notificationStatusQueue() {
    return new Queue(NOTIFICATION_STATUS_QUEUE, true);
  }

  @Bean
  public Queue labCompletedQueue() {
    return new Queue(LAB_COMPLETED_QUEUE, true);
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
  public Queue appointmentNotificationQueue() {
    return new Queue(APPOINTMENT_NOTIFICATION_QUEUE, true);
  }

  @Bean
  public Queue chatQueue() {
    return new Queue(CHAT_QUEUE, true);
  }

  @Bean
  public Queue prescriptionQueue() {
    return new Queue(PRESCRIPTION_QUEUE, true);
  }

  @Bean
  public Queue userCreatedQueue() {
    return new Queue(USER_CREATED_QUEUE, true);
  }

  @Bean
  public Queue stockLowQueue() {
    return new Queue(STOCK_LOW_QUEUE, true);
  }

  @Bean
  public Binding notificationStatusBinding() {
    return BindingBuilder.bind(notificationStatusQueue()).to(exchange()).with("notification.status.#");
  }

  @Bean
  public Binding labCompletedBinding() {
    return BindingBuilder.bind(labCompletedQueue()).to(exchange()).with("notification.lab.completed");
  }

  @Bean
  public Binding waitlistBinding() {
    return BindingBuilder.bind(waitlistQueue()).to(exchange()).with("notification.waitlist.available");
  }

  @Bean
  public Binding appointmentBinding() {
    return BindingBuilder.bind(appointmentNotificationQueue()).to(exchange()).with("appointment.event.#");
  }

  @Bean
  public Binding chatBinding() {
    return BindingBuilder.bind(chatQueue()).to(exchange()).with("notification.chat.#");
  }

  @Bean
  public Binding prescriptionBinding() {
    return BindingBuilder.bind(prescriptionQueue()).to(exchange()).with("notification.prescription.#");
  }

  @Bean
  public Binding userCreatedBinding() {
    return BindingBuilder.bind(userCreatedQueue()).to(exchange()).with("user.event.created");
  }

  @Bean
  public Binding delayedReminderBinding() {
    return BindingBuilder.bind(reminderQueue()).to(delayedExchange()).with("notification.appointment.reminder").noargs();
  }

  @Bean
  public Binding stockLowBinding() {
    return BindingBuilder.bind(stockLowQueue()).to(exchange()).with("pharmacy.stock.#");
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