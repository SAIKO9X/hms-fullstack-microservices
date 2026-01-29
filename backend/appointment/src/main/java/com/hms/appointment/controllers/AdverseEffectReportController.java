package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;
import com.hms.appointment.services.AdverseEffectReportService;
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
@RequestMapping("/adverse-effects")
public class AdverseEffectReportController {

  private final AdverseEffectReportService reportService;

  @PostMapping
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<AdverseEffectReportResponse> createReport(@Valid @RequestBody AdverseEffectReportCreateRequest request, Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(reportService.createReport(patientId, request));
  }

  @GetMapping("/doctor")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<Page<AdverseEffectReportResponse>> getMyReports(
    @PageableDefault(size = 10, sort = "reportedAt", direction = Sort.Direction.DESC) Pageable pageable,
    Authentication authentication
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(reportService.getReportsByDoctorId(doctorId, pageable));
  }

  @PutMapping("/{reportId}/review")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<AdverseEffectReportResponse> markReportAsReviewed(@PathVariable Long reportId, Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(reportService.markAsReviewed(reportId, doctorId));
  }
}