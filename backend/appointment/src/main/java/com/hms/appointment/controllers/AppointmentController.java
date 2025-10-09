package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.appointment.services.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

  private final AppointmentService appointmentService;
  private final JwtService jwtService;


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

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}