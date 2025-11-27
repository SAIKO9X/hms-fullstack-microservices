package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.dto.response.AppointmentStatsResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appointments/patient")
@RequiredArgsConstructor
public class PatientAppointmentController {

  private final AppointmentService appointmentService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public AppointmentResponse createAppointment(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody AppointmentCreateRequest request) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.createAppointment(patientId, request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public Page<AppointmentResponse> getMyAppointments(
    @RequestHeader("Authorization") String token,
    @PageableDefault(size = 10, sort = "appointmentDateTime", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = getUserIdFromToken(token);
    return appointmentService.getAppointmentsForPatient(patientId, pageable);
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