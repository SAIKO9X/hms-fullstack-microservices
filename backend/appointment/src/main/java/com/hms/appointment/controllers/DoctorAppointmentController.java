package com.hms.appointment.controllers;


import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.AppointmentDetailResponse;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.dto.response.DoctorDashboardStatsResponse;
import com.hms.appointment.dto.response.PatientGroupResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import lombok.RequiredArgsConstructor;
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
  private final JwtService jwtService;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentResponse> getMyAppointmentsAsDoctor(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForDoctor(doctorId);
  }

  @GetMapping("/details")
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentDetailResponse> getAppointmentDetails(
    @RequestHeader("Authorization") String token,
    @RequestParam(name = "date", required = false) String dateFilter
  ) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.getAppointmentDetailsForDoctor(doctorId, dateFilter);
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

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}