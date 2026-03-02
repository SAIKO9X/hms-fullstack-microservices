package com.hms.appointment.controllers;

import com.hms.appointment.docs.HealthMetricControllerDocs;
import com.hms.appointment.dto.request.HealthMetricCreateRequest;
import com.hms.appointment.dto.response.HealthMetricResponse;
import com.hms.appointment.services.HealthMetricService;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
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
@RequiredArgsConstructor
@RequestMapping("/health-metrics")
public class HealthMetricController implements HealthMetricControllerDocs {

  private final HealthMetricService healthMetricService;

  @PostMapping
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<ResponseWrapper<HealthMetricResponse>> addHealthMetric(
    Authentication authentication,
    @Valid @RequestBody HealthMetricCreateRequest request
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(healthMetricService.createHealthMetric(patientId, request)));
  }

  @GetMapping("/latest")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<ResponseWrapper<HealthMetricResponse>> getLatestMetric(Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(healthMetricService.getLatestHealthMetric(patientId)));
  }

  @GetMapping("/history")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<ResponseWrapper<PagedResponse<HealthMetricResponse>>> getHealthMetricHistory(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "recordedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    Page<HealthMetricResponse> page = healthMetricService.getHealthMetricHistory(patientId, pageable);
    return ResponseEntity.ok(ResponseWrapper.success(PagedResponse.of(page)));
  }
}