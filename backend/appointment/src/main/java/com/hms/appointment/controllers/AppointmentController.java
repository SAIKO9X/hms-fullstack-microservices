package com.hms.appointment.controllers;

import com.hms.appointment.request.AppointmentCreateRequest;
import com.hms.appointment.request.AppointmentUpdateRequest;
import com.hms.appointment.response.*;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

  private final AppointmentService appointmentService;
  private final JwtService jwtService;

  // --- Endpoints para Pacientes ---
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public AppointmentResponse scheduleAppointment(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody AppointmentCreateRequest request) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.createAppointment(patientId, request);
  }

  @GetMapping("/patient")
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentResponse> getMyAppointmentsAsPatient(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForPatient(patientId);
  }

  @GetMapping("/patient/next")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentResponse getNextAppointment(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getNextAppointmentForPatient(patientId);
  }

  @GetMapping("/patient/stats")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentStatsResponse getAppointmentStats(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getAppointmentStatsForPatient(patientId);
  }

  // --- Endpoints para Doutores ---
  @GetMapping("/doctor")
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentResponse> getMyAppointmentsAsDoctor(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForDoctor(doctorId);
  }

  @GetMapping("/doctor/details")
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

  @GetMapping("/doctor/dashboard-stats")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<DoctorDashboardStatsResponse> getDoctorDashboardStats(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    DoctorDashboardStatsResponse stats = appointmentService.getDoctorDashboardStats(doctorId);
    return ResponseEntity.ok(stats);
  }

  @GetMapping("/doctor/patients-count")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<Long> getUniquePatientsCount(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    long count = appointmentService.countUniquePatientsForDoctor(doctorId);
    return ResponseEntity.ok(count);
  }

  @GetMapping("/doctor/patient-groups")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<List<PatientGroupResponse>> getPatientGroups(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    List<PatientGroupResponse> groups = appointmentService.getPatientGroupsForDoctor(doctorId);
    return ResponseEntity.ok(groups);
  }

  // --- Endpoints Comuns (Pacientes e Doutores) ---
  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentResponse getAppointmentById(@PathVariable Long id, @RequestHeader("Authorization") String token) {
    Long requesterId = getUserIdFromToken(token);
    return appointmentService.getAppointmentById(id, requesterId);
  }

  @PatchMapping("/{id}/cancel")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentResponse cancelAppointment(@PathVariable Long id, @RequestHeader("Authorization") String token) {
    Long requesterId = getUserIdFromToken(token);
    return appointmentService.cancelAppointment(id, requesterId);
  }

  @PatchMapping("/{id}/reschedule")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentResponse rescheduleAppointment(
    @PathVariable Long id,
    @RequestBody AppointmentUpdateRequest request,
    @RequestHeader("Authorization") String token
  ) {
    Long requesterId = getUserIdFromToken(token);
    LocalDateTime newDateTime = request.appointmentDateTime();
    return appointmentService.rescheduleAppointment(id, newDateTime, requesterId);
  }

  // --- Método Auxiliar ---
  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}