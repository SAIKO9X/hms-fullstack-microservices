package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.DoctorUnavailabilityRequest;
import com.hms.appointment.dto.response.DoctorUnavailabilityResponse;
import com.hms.appointment.services.DoctorUnavailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments/unavailability")
@RequiredArgsConstructor
public class DoctorUnavailabilityController {

  private final DoctorUnavailabilityService service;

  @PostMapping
  public ResponseEntity<DoctorUnavailabilityResponse> create(@Valid @RequestBody DoctorUnavailabilityRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.createUnavailability(request));
  }

  @GetMapping("/doctor/{doctorId}")
  public ResponseEntity<List<DoctorUnavailabilityResponse>> listByDoctor(@PathVariable Long doctorId) {
    return ResponseEntity.ok(service.getUnavailabilityByDoctor(doctorId));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.deleteUnavailability(id);
    return ResponseEntity.noContent().build();
  }
}