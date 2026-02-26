package com.hms.appointment;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class BaseIntegrationTest {

  @Container
  @ServiceConnection
  static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
    .withDatabaseName("hms_appointment_test")
    .withUsername("test")
    .withPassword("test");

  @DynamicPropertySource
  static void overrideProperties(DynamicPropertyRegistry registry) {
    // desativa o Eureka
    registry.add("eureka.client.enabled", () -> "false");
    registry.add("spring.cloud.discovery.enabled", () -> "false");

    // desativa o cache do Redis
    registry.add("spring.cache.type", () -> "none");
    registry.add("spring.data.redis.repositories.enabled", () -> "false");

    // falsifica a conexão com RabbitMQ
    registry.add("spring.rabbitmq.host", () -> "localhost");
    registry.add("spring.rabbitmq.port", () -> "5672");
    registry.add("spring.rabbitmq.listener.simple.auto-startup", () -> "false");

    // configura a chave secreta do JWT para os testes
    registry.add("JWT_SECRET", () -> "dGVzdGUtc2VjcmV0LWtleS1wYXJhLWludGVncmFjYW8tc3ByaW5nLWJvb3QtandsLTI1NmJpdHM=");
    registry.add("application.security.jwt.secret-key", () -> "dGVzdGUtc2VjcmV0LWtleS1wYXJhLWludGVncmFjYW8tc3ByaW5nLWJvb3QtandsLTI1NmJpdHM=");
  }
}