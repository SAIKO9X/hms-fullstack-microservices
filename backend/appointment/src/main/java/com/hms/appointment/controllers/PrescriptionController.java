package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
import com.hms.appointment.services.JwtService;
import com.hms.appointment.services.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

  private final PrescriptionService prescriptionService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('DOCTOR')")
  public PrescriptionResponse createPrescription(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody PrescriptionCreateRequest request) {
    Long doctorId = getUserIdFromToken(token);
    return prescriptionService.createPrescription(request, doctorId);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public PrescriptionResponse getPrescriptionById(
    @RequestHeader("Authorization") String token,
    @PathVariable Long id) {
    Long requesterId = getUserIdFromToken(token);
    return prescriptionService.getPrescriptionByAppointmentId(id, requesterId);
  }

  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('DOCTOR')")
  public PrescriptionResponse updatePrescription(
    @RequestHeader("Authorization") String token,
    @PathVariable Long id,
    @Valid @RequestBody PrescriptionUpdateRequest request) {
    Long doctorId = getUserIdFromToken(token);
    return prescriptionService.updatePrescription(id, request, doctorId);
  }

  // === ALTERADO PARA PAGINAÇÃO ===
  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  public Page<PrescriptionResponse> getPrescriptionsByPatientId(
    @RequestHeader("Authorization") String token,
    @PathVariable Long patientId,
    @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long requesterId = getUserIdFromToken(token);
    return prescriptionService.getPrescriptionsByPatientId(patientId, requesterId, pageable);
  }

  @GetMapping("/patient/my-history")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public Page<PrescriptionResponse> getMyPrescriptionHistory(
    @RequestHeader("Authorization") String token,
    @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = getUserIdFromToken(token);
    // Reutiliza o método de serviço existente, passando o ID do próprio paciente
    return prescriptionService.getPrescriptionsByPatientId(patientId, patientId, pageable);
  }

  @GetMapping("/pharmacy-access/{id}")
  @ResponseStatus(HttpStatus.OK)
  public PrescriptionForPharmacyResponse getPrescriptionForPharmacy(@PathVariable Long id) {
    return prescriptionService.getPrescriptionForPharmacy(id);
  }

  @GetMapping("/patient/latest")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public PrescriptionResponse getLatestPrescription(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return prescriptionService.getLatestPrescriptionByPatientId(patientId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}