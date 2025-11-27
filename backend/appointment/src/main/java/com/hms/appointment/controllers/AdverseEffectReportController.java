package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;
import com.hms.appointment.services.AdverseEffectReportService;
import com.hms.appointment.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/adverse-effects")
public class AdverseEffectReportController {

  private final AdverseEffectReportService reportService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('PATIENT')")
  public AdverseEffectReportResponse createReport(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody AdverseEffectReportCreateRequest request) {
    Long patientId = getUserIdFromToken(token);
    return reportService.createReport(patientId, request);
  }

  @GetMapping("/doctor")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('DOCTOR')")
  public Page<AdverseEffectReportResponse> getMyReports(
    @RequestHeader("Authorization") String token,
    @PageableDefault(size = 10, sort = "reportedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long doctorId = getUserIdFromToken(token);
    return reportService.getReportsByDoctorId(doctorId, pageable);
  }

  @PutMapping("/{reportId}/review")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('DOCTOR')")
  public AdverseEffectReportResponse markReportAsReviewed(
    @RequestHeader("Authorization") String token,
    @PathVariable Long reportId) {
    Long doctorId = getUserIdFromToken(token);
    return reportService.markAsReviewed(reportId, doctorId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}