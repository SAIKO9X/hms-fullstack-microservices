package com.hms.appointment.controllers;

import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/stats")
public class AdminStatsController {

  private final AppointmentService appointmentService;

  @GetMapping("/appointments-today")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Long> getAppointmentsTodayCount() {
    return ResponseEntity.ok(appointmentService.countAllAppointmentsForToday());
  }
}