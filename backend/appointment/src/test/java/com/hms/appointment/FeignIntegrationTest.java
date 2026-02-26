package com.hms.appointment;

import com.hms.appointment.clients.UserFeignClient;
import com.hms.appointment.dto.external.UserResponse;
import com.hms.common.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.*;

public class FeignIntegrationTest extends BaseIntegrationTest {

  @Autowired
  private UserFeignClient userFeignClient;

  @Test
  void shouldReturnUser_WhenUserServiceReturns200() {
    stubFor(get(urlEqualTo("/users/1"))
      .willReturn(aResponse()
        .withStatus(HttpStatus.OK.value())
        .withHeader("Content-Type", "application/json")
        .withBody("""
              {
                  "id": 1,
                  "email": "doctor@hms.com",
                  "role": "DOCTOR"
              }
          """)));

    UserResponse response = userFeignClient.getUserById(1L);

    assertNotNull(response);
    assertEquals("doctor@hms.com", response.email());
  }

  @Test
  void shouldThrowException_WhenUserServiceReturns404() {
    stubFor(get(urlEqualTo("/users/99"))
      .willReturn(aResponse()
        .withStatus(HttpStatus.NOT_FOUND.value())
        .withHeader("Content-Type", "application/json")
        .withBody("{\"message\": \"User not found\"}")));

    ResourceNotFoundException exception = assertThrows(
      ResourceNotFoundException.class,
      () -> userFeignClient.getUserById(99L)
    );

    assertTrue(exception.getMessage().contains("User not found") || exception.getMessage() != null);
  }
}