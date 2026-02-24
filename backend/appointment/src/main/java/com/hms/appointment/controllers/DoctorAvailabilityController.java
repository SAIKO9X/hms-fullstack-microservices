package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AvailabilityRequest;
import com.hms.appointment.dto.response.AvailabilityResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appointments/availability")
public class DoctorAvailabilityController {

  private final AppointmentService appointmentService;

  @GetMapping("/{doctorId}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
  public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getAvailability(@PathVariable Long doctorId) {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorAvailability(doctorId)));
  }

  @PostMapping("/{doctorId}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public ResponseEntity<ApiResponse<AvailabilityResponse>> addAvailability(@PathVariable Long doctorId, @RequestBody AvailabilityRequest request) {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.addAvailability(doctorId, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable Long id) {
    appointmentService.deleteAvailability(id);
    return ResponseEntity.ok(ApiResponse.success(null, "Disponibilidade removida com sucesso."));
  }

  @GetMapping("/available-slots")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
  public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(
    @RequestParam Long doctorId,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
    @RequestParam(required = false, defaultValue = "30") Integer duration
  ) {
    List<String> slots = appointmentService.getAvailableTimeSlots(doctorId, date, duration);
    return ResponseEntity.ok(ApiResponse.success(slots));
  }
}