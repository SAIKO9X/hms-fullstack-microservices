package com.hms.profile.config;

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

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  // user created
  @Value("${application.rabbitmq.user-created-queue}")
  private String userCreatedQueue;

  @Value("${application.rabbitmq.user-created-routing-key}")
  private String userCreatedRoutingKey;

  // user updated
  @Value("${application.rabbitmq.user-updated-queue}")
  private String userUpdatedQueue;

  @Value("${application.rabbitmq.user-updated-routing-key}")
  private String userUpdatedRoutingKey;

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange(exchange);
  }

  // create
  @Bean
  public Queue userCreatedQueue() {
    return new Queue(userCreatedQueue, true);
  }

  @Bean
  public Binding bindingUserCreated() {
    return BindingBuilder
      .bind(userCreatedQueue())
      .to(exchange())
      .with(userCreatedRoutingKey);
  }

  // update
  @Bean
  public Queue userUpdatedQueue() {
    return new Queue(userUpdatedQueue, true);
  }

  @Bean
  public Binding bindingUserUpdated() {
    return BindingBuilder
      .bind(userUpdatedQueue())
      .to(exchange())
      .with(userUpdatedRoutingKey);
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