package com.hms.billing.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

  @Value("${rabbitmq.queues.appointment-billing}")
  private String billingQueue;

  @Value("${rabbitmq.exchanges.internal}")
  private String internalExchange;

  @Value("${rabbitmq.routing-keys.appointment-completed}")
  private String appointmentCompletedRoutingKey;

  @Bean
  public Queue billingQueue() {
    return new Queue(billingQueue);
  }

  @Bean
  public TopicExchange internalExchange() {
    return new TopicExchange(internalExchange);
  }

  @Bean
  public Binding billingBinding() {
    return BindingBuilder
      .bind(billingQueue())
      .to(internalExchange())
      .with(appointmentCompletedRoutingKey);
  }

  @Bean
  public MessageConverter converter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(converter());
    return rabbitTemplate;
  }
}