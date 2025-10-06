package com.hms.appointment.controllers;

import com.hms.appointment.request.PrescriptionCreateRequest;
import com.hms.appointment.request.PrescriptionUpdateRequest;
import com.hms.appointment.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.response.PrescriptionResponse;
import com.hms.appointment.services.JwtService;
import com.hms.appointment.services.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/prescriptions")
public class PrescriptionController {

  private final PrescriptionService prescriptionService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PrescriptionResponse createPrescription(@RequestHeader("Authorization") String token, @Valid @RequestBody PrescriptionCreateRequest request) {
    Long doctorId = getUserIdFromToken(token);
    return prescriptionService.createPrescription(request, doctorId);
  }

  @GetMapping("/appointment/{appointmentId}")
  @ResponseStatus(HttpStatus.OK)
  public PrescriptionResponse getPrescriptionByAppointmentId(@RequestHeader("Authorization") String token, @PathVariable Long appointmentId) {
    Long requesterId = getUserIdFromToken(token);
    return prescriptionService.getPrescriptionByAppointmentId(appointmentId, requesterId);
  }

  @PutMapping("/{prescriptionId}")
  @ResponseStatus(HttpStatus.OK)
  public PrescriptionResponse updatePrescription(
    @RequestHeader("Authorization") String token,
    @PathVariable Long prescriptionId,
    @Valid @RequestBody PrescriptionUpdateRequest request
  ) {
    Long doctorId = getUserIdFromToken(token);
    return prescriptionService.updatePrescription(prescriptionId, request, doctorId);
  }

  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  public List<PrescriptionResponse> getPrescriptionsByPatientId(@RequestHeader("Authorization") String token, @PathVariable Long patientId) {
    Long requesterId = getUserIdFromToken(token);
    return prescriptionService.getPrescriptionsByPatientId(patientId, requesterId);
  }

  @GetMapping("/{id}/for-pharmacy")
  @ResponseStatus(HttpStatus.OK)
  public PrescriptionForPharmacyResponse getPrescriptionForPharmacy(@PathVariable Long id) {
    // Este endpoint será chamado internamente pelo pharmacy-service
    return prescriptionService.getPrescriptionForPharmacy(id);
  }

  @GetMapping("/patient/latest")
  @ResponseStatus(HttpStatus.OK)
  public PrescriptionResponse getLatestPrescription(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return prescriptionService.getLatestPrescriptionByPatientId(patientId);
  }

  @GetMapping("/patient/my-history")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public List<PrescriptionResponse> getMyPrescriptionHistory(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    // Reutiliza o método de serviço existente, passando o ID do próprio paciente
    return prescriptionService.getPrescriptionsByPatientId(patientId, patientId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}