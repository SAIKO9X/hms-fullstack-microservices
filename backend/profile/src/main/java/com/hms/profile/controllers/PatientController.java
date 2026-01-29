package com.hms.profile.controllers;

import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
import com.hms.profile.dto.request.AdminPatientUpdateRequest;
import com.hms.profile.dto.request.PatientCreateRequest;
import com.hms.profile.dto.request.PatientUpdateRequest;
import com.hms.profile.dto.request.ProfilePictureUpdateRequest;
import com.hms.profile.dto.response.PatientDropdownResponse;
import com.hms.profile.dto.response.PatientResponse;
import com.hms.profile.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/patients")
public class PatientController {

  private final PatientService patientService;

  @PostMapping
  public ResponseEntity<PatientResponse> createPatientProfile(@Valid @RequestBody PatientCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(patientService.createPatientProfile(request));
  }

  @GetMapping
  public ResponseEntity<PatientResponse> getMyProfile(Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(patientService.getPatientProfileByUserId(userId));
  }

  @PatchMapping
  public ResponseEntity<PatientResponse> updateMyProfile(
    Authentication authentication,
    @Valid @RequestBody PatientUpdateRequest request
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(patientService.updatePatientProfile(userId, request));
  }

  @GetMapping("/exists/{userId}")
  public ResponseEntity<Boolean> patientProfileExists(@PathVariable Long userId) {
    return ResponseEntity.ok(patientService.patientProfileExists(userId));
  }

  @GetMapping("/by-user/{userId}")
  public ResponseEntity<PatientResponse> getProfileByUserId(@PathVariable Long userId) {
    return ResponseEntity.ok(patientService.getPatientProfileByUserId(userId));
  }

  @GetMapping("/dropdown")
  public ResponseEntity<List<PatientDropdownResponse>> getPatientsForDropdown() {
    return ResponseEntity.ok(patientService.getPatientsForDropdown());
  }

  @GetMapping("/all")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<PatientResponse>> getAllPatientProfiles(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
    return ResponseEntity.ok(patientService.findAllPatients(pageable));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
  @Auditable(action = "VIEW_PATIENT_PROFILE", resourceName = "PatientProfile")
  public ResponseEntity<PatientResponse> getPatientProfileById(@PathVariable Long id) {
    return ResponseEntity.ok(patientService.getPatientProfileById(id));
  }

  @PutMapping("/picture")
  public ResponseEntity<Void> updatePatientProfilePicture(
    Authentication authentication,
    @Valid @RequestBody ProfilePictureUpdateRequest request
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    patientService.updateProfilePicture(userId, request.pictureUrl());
    return ResponseEntity.ok().build();
  }

  @PutMapping("/admin/update/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "ADMIN_UPDATE_PATIENT", resourceName = "PatientProfile")
  public ResponseEntity<Void> adminUpdatePatient(
    @PathVariable("userId") Long userId,
    @RequestBody AdminPatientUpdateRequest updateRequest
  ) {
    patientService.adminUpdatePatient(userId, updateRequest);
    return ResponseEntity.ok().build();
  }
}