package com.hms.appointment.controllers;

import com.hms.appointment.request.AppointmentCreateRequest;
import com.hms.appointment.request.AppointmentUpdateRequest;
import com.hms.appointment.response.AppointmentResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

  // --- Endpoints para Doutores ---
  @GetMapping("/doctor")
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentResponse> getMyAppointmentsAsDoctor(@RequestHeader("Authorization") String token) {
    Long doctorId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForDoctor(doctorId);
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