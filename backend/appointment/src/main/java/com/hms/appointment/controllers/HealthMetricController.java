package com.hms.appointment.controllers;

import com.hms.appointment.request.HealthMetricCreateRequest;
import com.hms.appointment.response.HealthMetricResponse;
import com.hms.appointment.services.HealthMetricService;
import com.hms.appointment.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/health-metrics")
public class HealthMetricController {

  private final HealthMetricService healthMetricService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('PATIENT')")
  public HealthMetricResponse addHealthMetric(@RequestHeader("Authorization") String token, @Valid @RequestBody HealthMetricCreateRequest request) {
    Long patientId = getUserIdFromToken(token);
    return healthMetricService.createHealthMetric(patientId, request);
  }

  @GetMapping("/latest")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public HealthMetricResponse getLatestHealthMetric(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return healthMetricService.getLatestHealthMetric(patientId);
  }

  @GetMapping("/history")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public List<HealthMetricResponse> getHealthMetricHistory(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return healthMetricService.getHealthMetricHistory(patientId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}