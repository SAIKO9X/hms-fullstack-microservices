package com.hms.appointment.controllers;


import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@RequestMapping("/doctor/appointments")
public class DoctorAppointmentController {

  private final AppointmentService appointmentService;
  private final AppointmentRepository appointmentRepository;
  private final JwtService jwtService;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public Page<AppointmentResponse> getMyAppointments(
    @RequestHeader("Authorization") String token,
    @PageableDefault(size = 10, sort = "appointmentDateTime", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForDoctor(doctorId, pageable);
  }

  @GetMapping("/details")
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentDetailResponse> getAppointmentDetails(
    @RequestHeader("Authorization") String token,
    @RequestParam(required = false, defaultValue = "all") String filter
  ) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.getAppointmentDetailsForDoctor(doctorId, filter);
  }

  @PatchMapping("/{id}/complete")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentResponse completeAppointment(
    @PathVariable Long id,
    @RequestBody AppointmentUpdateRequest request,
    @RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.completeAppointment(id, request.notes(), doctorId);
  }

  @GetMapping("/dashboard-stats")
  public ResponseEntity<DoctorDashboardStatsResponse> getDoctorDashboardStats(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    DoctorDashboardStatsResponse stats = appointmentService.getDoctorDashboardStats(doctorId);
    return ResponseEntity.ok(stats);
  }

  @GetMapping("/patients-count")
  public ResponseEntity<Long> getUniquePatientsCount(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    long count = appointmentService.countUniquePatientsForDoctor(doctorId);
    return ResponseEntity.ok(count);
  }

  @GetMapping("/patient-groups")
  public ResponseEntity<List<PatientGroupResponse>> getPatientGroups(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    List<PatientGroupResponse> groups = appointmentService.getPatientGroupsForDoctor(doctorId);
    return ResponseEntity.ok(groups);
  }

  @GetMapping("/my-patients")
  public ResponseEntity<List<DoctorPatientSummaryDto>> getMyPatients(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    List<DoctorPatientSummaryDto> patients = appointmentService.getPatientsForDoctor(doctorId);
    return ResponseEntity.ok(patients);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}