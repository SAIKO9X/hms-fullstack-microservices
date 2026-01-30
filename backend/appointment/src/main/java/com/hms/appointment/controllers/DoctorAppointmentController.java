package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentCompleteRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@RequestMapping("/doctor/appointments")
public class DoctorAppointmentController {

  private final AppointmentService appointmentService;

  @GetMapping
  public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getMyAppointments(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "appointmentDateTime", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    Page<AppointmentResponse> page = appointmentService.getAppointmentsForDoctor(doctorId, pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @GetMapping("/details")
  public ResponseEntity<ApiResponse<List<AppointmentDetailResponse>>> getAppointmentDetails(
    Authentication authentication,
    @RequestParam(required = false, defaultValue = "all") String filter
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentDetailsForDoctor(doctorId, filter)));
  }

  @PatchMapping("/{id}/complete")
  public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
    Authentication authentication,
    @PathVariable Long id,
    @RequestBody AppointmentCompleteRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.completeAppointment(id, request.notes(), doctorId)));
  }

  @GetMapping("/dashboard-stats")
  public ResponseEntity<ApiResponse<DoctorDashboardStatsResponse>> getDoctorDashboardStats(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorDashboardStats(doctorId)));
  }

  @GetMapping("/patients-count")
  public ResponseEntity<ApiResponse<Long>> getUniquePatientsCount(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.countUniquePatientsForDoctor(doctorId)));
  }

  @GetMapping("/patient-groups")
  public ResponseEntity<ApiResponse<List<PatientGroupResponse>>> getPatientGroups(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getPatientGroupsForDoctor(doctorId)));
  }

  @GetMapping("/my-patients")
  public ResponseEntity<ApiResponse<List<DoctorPatientSummaryDto>>> getMyPatients(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getPatientsForDoctor(doctorId)));
  }
}