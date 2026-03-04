package com.hms.appointment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

  public static final GenericContainer<?> redisContainer =
    new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
      .withExposedPorts(6379);

  static {
    redisContainer.start();
  }

  @RegisterExtension
  static WireMockExtension wiremock = WireMockExtension.newInstance()
    .options(wireMockConfig().dynamicPort())
    .build();

  @DynamicPropertySource
  static void registerProperties(DynamicPropertyRegistry registry) {
    // Redis
    registry.add("spring.data.redis.host", redisContainer::getHost);
    registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379).toString());
    registry.add("spring.cache.type", () -> "redis");

    registry.add("feign.user-service.url", wiremock::baseUrl);
    registry.add("feign.profile-service.url", wiremock::baseUrl);
  }

  @BeforeEach
  void initWireMock() {
    WireMock.configureFor(wiremock.getPort());
    wiremock.resetAll();
  }
}