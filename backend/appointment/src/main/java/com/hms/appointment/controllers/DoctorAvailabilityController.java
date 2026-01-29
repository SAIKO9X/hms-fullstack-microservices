package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AvailabilityRequest;
import com.hms.appointment.dto.response.AvailabilityResponse;
import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/appointments/availability")
public class DoctorAvailabilityController {

  private final AppointmentService appointmentService;

  @GetMapping("/{doctorId}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public ResponseEntity<List<AvailabilityResponse>> getAvailability(@PathVariable Long doctorId) {
    return ResponseEntity.ok(appointmentService.getDoctorAvailability(doctorId));
  }

  @PostMapping("/{doctorId}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public ResponseEntity<AvailabilityResponse> addAvailability(@PathVariable Long doctorId, @RequestBody AvailabilityRequest request) {
    return ResponseEntity.ok(appointmentService.addAvailability(doctorId, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
    appointmentService.deleteAvailability(id);
    return ResponseEntity.noContent().build();
  }
}