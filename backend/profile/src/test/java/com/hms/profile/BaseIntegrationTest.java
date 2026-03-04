package com.hms.profile;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@Testcontainers
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class BaseIntegrationTest {

  @Container
  @ServiceConnection
  static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
    .withDatabaseName("hms_profile_test")
    .withUsername("test")
    .withPassword("test");

  @Container
  static GenericContainer<?> redisContainer = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
    .withExposedPorts(6379);

  @DynamicPropertySource
  static void overrideProperties(DynamicPropertyRegistry registry) {
    registry.add("eureka.client.enabled", () -> "false");
    registry.add("spring.cloud.discovery.enabled", () -> "false");

    // JWT Secret
    registry.add("JWT_SECRET", () -> "dGVzdGUtc2VjcmV0LWtleS1wYXJhLWludGVncmFjYW8tc3ByaW5nLWJvb3QtandsLTI1NmJpdHM=");
    registry.add("application.security.jwt.secret-key", () -> "dGVzdGUtc2VjcmV0LWtleS1wYXJhLWludGVncmFjYW8tc3ByaW5nLWJvb3QtandsLTI1NmJpdHM=");

    // Redis
    registry.add("spring.data.redis.host", redisContainer::getHost);
    registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379));
  }
}