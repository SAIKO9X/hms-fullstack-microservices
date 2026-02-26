package com.hms.gateway.filter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteValidatorTest {

  private final RouteValidator routeValidator = new RouteValidator();

  @Test
  @DisplayName("Deve retornar falso (isSecured = false) para rotas públicas como login e registro")
  void isSecured_WithPublicEndpoint_ShouldReturnFalse() {
    MockServerHttpRequest requestLogin = MockServerHttpRequest.post("/auth/login").build();
    MockServerHttpRequest requestRegister = MockServerHttpRequest.post("/users/register").build();
    MockServerHttpRequest requestEureka = MockServerHttpRequest.get("/eureka/apps").build();

    assertFalse(routeValidator.isSecured.test(requestLogin));
    assertFalse(routeValidator.isSecured.test(requestRegister));
    assertFalse(routeValidator.isSecured.test(requestEureka));
  }

  @Test
  @DisplayName("Deve retornar verdadeiro (isSecured = true) para rotas privadas de microsserviços")
  void isSecured_WithPrivateEndpoint_ShouldReturnTrue() {
    MockServerHttpRequest requestAppointments = MockServerHttpRequest.get("/api/appointments/list").build();
    MockServerHttpRequest requestPatients = MockServerHttpRequest.post("/api/patients/create").build();

    assertTrue(routeValidator.isSecured.test(requestAppointments));
    assertTrue(routeValidator.isSecured.test(requestPatients));
  }
}