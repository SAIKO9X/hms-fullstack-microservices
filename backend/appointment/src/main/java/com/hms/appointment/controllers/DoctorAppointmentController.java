package com.hms.appointment.controllers;

import com.hms.appointment.docs.DoctorAppointmentControllerDocs;
import com.hms.appointment.dto.request.AppointmentCompleteRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
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
public class DoctorAppointmentController implements DoctorAppointmentControllerDocs {

  private final AppointmentService appointmentService;

  @GetMapping
  public ResponseEntity<ResponseWrapper<PagedResponse<AppointmentResponse>>> getMyAppointments(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "appointmentDateTime", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    Page<AppointmentResponse> page = appointmentService.getAppointmentsForDoctor(doctorId, pageable);
    return ResponseEntity.ok(ResponseWrapper.success(PagedResponse.of(page)));
  }

  @GetMapping("/details")
  public ResponseEntity<ResponseWrapper<List<AppointmentDetailResponse>>> getAppointmentDetails(
    Authentication authentication,
    @RequestParam(required = false, defaultValue = "all") String filter
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getAppointmentDetailsForDoctor(doctorId, filter)));
  }

  @PatchMapping("/{id}/complete")
  public ResponseEntity<ResponseWrapper<AppointmentResponse>> completeAppointment(
    Authentication authentication,
    @PathVariable Long id,
    @RequestBody AppointmentCompleteRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.completeAppointment(id, request.notes(), doctorId)));
  }

  @GetMapping("/dashboard-stats")
  public ResponseEntity<ResponseWrapper<DoctorDashboardStatsResponse>> getDoctorDashboardStats(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getDoctorDashboardStats(doctorId)));
  }

  @GetMapping("/patients-count")
  public ResponseEntity<ResponseWrapper<Long>> getUniquePatientsCount(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.countUniquePatientsForDoctor(doctorId)));
  }

  @GetMapping("/patient-groups")
  public ResponseEntity<ResponseWrapper<List<PatientGroupResponse>>> getPatientGroups(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getPatientGroupsForDoctor(doctorId)));
  }

  @GetMapping("/my-patients")
  public ResponseEntity<ResponseWrapper<List<DoctorPatientSummaryDto>>> getMyPatients(Authentication authentication) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getPatientsForDoctor(doctorId)));
  }
}