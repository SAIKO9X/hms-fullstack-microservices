package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import com.hms.common.security.Auditable;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

  private final AppointmentService appointmentService;
  private final JwtService jwtService;

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  @Auditable(action = "VIEW", resourceName = "APPOINTMENT")
  public AppointmentResponse getAppointmentById(@PathVariable Long id, @RequestHeader("Authorization") String token) {
    Long requesterId = getUserIdFromToken(token);
    return appointmentService.getAppointmentById(id, requesterId);
  }

  @PatchMapping("/{id}/cancel")
  @ResponseStatus(HttpStatus.OK)
  @Auditable(action = "CANCEL", resourceName = "APPOINTMENT")
  public AppointmentResponse cancelAppointment(@PathVariable Long id, @RequestHeader("Authorization") String token) {
    Long requesterId = getUserIdFromToken(token);
    return appointmentService.cancelAppointment(id, requesterId);
  }

  @PatchMapping("/{id}/reschedule")
  @ResponseStatus(HttpStatus.OK)
  @Auditable(action = "RESCHEDULE", resourceName = "APPOINTMENT")
  public AppointmentResponse rescheduleAppointment(
    @PathVariable Long id,
    @RequestBody AppointmentUpdateRequest request,
    @RequestHeader("Authorization") String token
  ) {
    Long requesterId = getUserIdFromToken(token);
    LocalDateTime newDateTime = request.appointmentDateTime();
    return appointmentService.rescheduleAppointment(id, newDateTime, requesterId);
  }

  @PatchMapping("/{id}/complete")
  @ResponseStatus(HttpStatus.OK)
  @Auditable(action = "COMPLETE", resourceName = "APPOINTMENT")
  public AppointmentResponse completeAppointment(
    @PathVariable Long id,
    @RequestBody Map<String, String> payload,
    @RequestHeader("Authorization") String token
  ) {
    Long doctorId = getUserIdFromToken(token);
    String notes = payload.get("notes");
    return appointmentService.completeAppointment(id, notes, doctorId);
  }

  @PostMapping("/waitlist")
  @ResponseStatus(HttpStatus.CREATED)
  public void joinWaitlist(
    @RequestHeader("X-User-Id") Long patientId,
    @RequestBody @Valid AppointmentCreateRequest request
  ) {
    appointmentService.joinWaitlist(patientId, request);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}