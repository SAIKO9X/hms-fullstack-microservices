package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.HealthMetricCreateRequest;
import com.hms.appointment.dto.response.HealthMetricResponse;
import com.hms.appointment.services.HealthMetricService;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/health-metrics")
@RequiredArgsConstructor
public class HealthMetricController {

  private final HealthMetricService healthMetricService;

  @PostMapping
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<HealthMetricResponse> addHealthMetric(
    Authentication authentication,
    @Valid @RequestBody HealthMetricCreateRequest request
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(healthMetricService.createHealthMetric(patientId, request));
  }

  @GetMapping("/latest")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<HealthMetricResponse> getLatestMetric(Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(healthMetricService.getLatestHealthMetric(patientId));
  }

  @GetMapping("/history")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<Page<HealthMetricResponse>> getHealthMetricHistory(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(healthMetricService.getHealthMetricHistory(patientId, pageable));
  }
}