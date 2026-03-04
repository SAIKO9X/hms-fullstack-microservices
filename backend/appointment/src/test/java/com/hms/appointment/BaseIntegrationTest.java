package com.hms.appointment;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
public abstract class BaseIntegrationTest {

  @Container
  public static GenericContainer<?> redisContainer = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
    .withExposedPorts(6379);

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    // Redis
    registry.add("spring.data.redis.host", redisContainer::getHost);
    registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379).toString());
  }
}