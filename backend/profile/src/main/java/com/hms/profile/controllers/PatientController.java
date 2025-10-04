package com.hms.profile.controllers;

import com.hms.profile.request.PatientCreateRequest;
import com.hms.profile.request.PatientUpdateRequest;
import com.hms.profile.response.PatientDropdownResponse;
import com.hms.profile.response.PatientResponse;
import com.hms.profile.services.JwtService;
import com.hms.profile.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/patients")
public class PatientController {

  private final PatientService patientService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PatientResponse createPatientProfile(@Valid @RequestBody PatientCreateRequest request) {
    return patientService.createPatientProfile(request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public PatientResponse getMyProfile(@RequestHeader("Authorization") String token) {
    Long userId = getUserIdFromToken(token);
    return patientService.getPatientProfileByUserId(userId);
  }

  @PutMapping
  @ResponseStatus(HttpStatus.OK)
  public PatientResponse updateMyProfile(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody PatientUpdateRequest request) {
    Long userId = getUserIdFromToken(token);
    return patientService.updatePatientProfile(userId, request);
  }

  @GetMapping("/exists/{userId}")
  @ResponseStatus(HttpStatus.OK)
  public Boolean patientProfileExists(@PathVariable Long userId) {
    return patientService.patientProfileExists(userId);
  }

  @GetMapping("/by-user/{userId}")
  @ResponseStatus(HttpStatus.OK)
  public PatientResponse getProfileByUserId(@PathVariable Long userId) {
    return patientService.getPatientProfileByUserId(userId);
  }

  @GetMapping("/dropdown")
  @ResponseStatus(HttpStatus.OK)
  public List<PatientDropdownResponse> getPatientsForDropdown() {
    return patientService.getPatientsForDropdown();
  }

  @GetMapping("/patients/by-user/{userId}")
  @ResponseStatus(HttpStatus.OK)
  public PatientResponse getPatientByUserId(@PathVariable Long userId) {
    return patientService.getPatientProfileByUserId(userId);
  }

  @GetMapping("/all")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public List<PatientResponse> getAllPatientProfiles() {
    return patientService.findAllPatients();
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}