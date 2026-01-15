package com.hms.profile.controllers;

import com.hms.common.security.HmsUserPrincipal;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/patients")
public class PatientController {

  private final PatientService patientService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PatientResponse createPatientProfile(@Valid @RequestBody PatientCreateRequest request) {
    return patientService.createPatientProfile(request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public PatientResponse getMyProfile(@AuthenticationPrincipal HmsUserPrincipal user) {
    return patientService.getPatientProfileByUserId(user.getId());
  }

  @PatchMapping
  @ResponseStatus(HttpStatus.OK)
  public PatientResponse updateMyProfile(
    @AuthenticationPrincipal HmsUserPrincipal user,
    @Valid @RequestBody PatientUpdateRequest request) {
    return patientService.updatePatientProfile(user.getId(), request);
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

  @GetMapping("/all")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public Page<PatientResponse> getAllPatientProfiles(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
    return patientService.findAllPatients(pageable);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public PatientResponse getPatientProfileById(@PathVariable Long id) {
    return patientService.getPatientProfileById(id);
  }

  @PutMapping("/picture")
  @ResponseStatus(HttpStatus.OK)
  public void updatePatientProfilePicture(
    @AuthenticationPrincipal HmsUserPrincipal user,
    @Valid @RequestBody ProfilePictureUpdateRequest request) {
    patientService.updateProfilePicture(user.getId(), request.pictureUrl());
  }

  @PutMapping("/admin/update/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> adminUpdatePatient(
    @PathVariable("userId") Long userId,
    @RequestBody AdminPatientUpdateRequest updateRequest
  ) {
    patientService.adminUpdatePatient(userId, updateRequest);
    return ResponseEntity.ok().build();
  }
}