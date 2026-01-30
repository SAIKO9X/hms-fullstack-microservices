package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.DoctorUnavailabilityRequest;
import com.hms.appointment.dto.response.DoctorUnavailabilityResponse;
import com.hms.appointment.services.DoctorUnavailabilityService;
import com.hms.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments/unavailability")
@RequiredArgsConstructor
public class DoctorUnavailabilityController {

  private final DoctorUnavailabilityService service;

  @PostMapping
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<ApiResponse<DoctorUnavailabilityResponse>> create(@Valid @RequestBody DoctorUnavailabilityRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(service.createUnavailability(request)));
  }

  @GetMapping("/doctor/{doctorId}")
  public ResponseEntity<ApiResponse<List<DoctorUnavailabilityResponse>>> listByDoctor(@PathVariable Long doctorId) {
    return ResponseEntity.ok(ApiResponse.success(service.getUnavailabilityByDoctor(doctorId)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
    service.deleteUnavailability(id);
    return ResponseEntity.ok(ApiResponse.success(null, "Indisponibilidade removida com sucesso."));
  }
}