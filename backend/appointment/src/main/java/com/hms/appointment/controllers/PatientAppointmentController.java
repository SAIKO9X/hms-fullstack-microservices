package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.dto.response.AppointmentStatsResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
@RequestMapping("/patient/appointments")
public class PatientAppointmentController {

  private final AppointmentService appointmentService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public AppointmentResponse scheduleAppointment(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody AppointmentCreateRequest request) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.createAppointment(patientId, request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentResponse> getMyAppointmentsAsPatient(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForPatient(patientId);
  }

  @GetMapping("/next")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentResponse getNextAppointment(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getNextAppointmentForPatient(patientId);
  }

  @GetMapping("/stats")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentStatsResponse getAppointmentStats(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getAppointmentStatsForPatient(patientId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}