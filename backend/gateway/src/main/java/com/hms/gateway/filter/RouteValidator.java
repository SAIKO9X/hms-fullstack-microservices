package com.hms.gateway.filter;

import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

  public static final List<String> openApiEndpoints = List.of(
    "/auth/login",
    "/auth/refresh",
    "/auth/verify",
    "/auth/resend-code",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/users/register",
    "/eureka",
    "/v3/api-docs",
    "/swagger-ui"
  );

  public Predicate<ServerHttpRequest> isSecured =
    request -> {
      String path = request.getURI().getPath();
      HttpMethod method = request.getMethod();

      if (path.startsWith("/media") && HttpMethod.GET.equals(method)) {
        return false;
      }

      return openApiEndpoints
        .stream()
        .noneMatch(path::contains);
    };
}