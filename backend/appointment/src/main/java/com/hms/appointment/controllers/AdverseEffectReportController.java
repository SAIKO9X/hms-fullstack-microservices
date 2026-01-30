package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;
import com.hms.appointment.services.AdverseEffectReportService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
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
  public ResponseEntity<ApiResponse<AdverseEffectReportResponse>> createReport(@Valid @RequestBody AdverseEffectReportCreateRequest request, Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    AdverseEffectReportResponse response = reportService.createReport(patientId, request);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(response, "Relatório de efeito adverso criado com sucesso."));
  }

  @GetMapping("/doctor")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<ApiResponse<PagedResponse<AdverseEffectReportResponse>>> getMyReports(
    @PageableDefault(size = 10, sort = "reportedAt", direction = Sort.Direction.DESC) Pageable pageable,
    Authentication authentication
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    Page<AdverseEffectReportResponse> page = reportService.getReportsByDoctorId(doctorId, pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @PutMapping("/{reportId}/review")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<ApiResponse<AdverseEffectReportResponse>> markReportAsReviewed(@PathVariable Long reportId, Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(reportService.markAsReviewed(reportId, doctorId)));
  }
}