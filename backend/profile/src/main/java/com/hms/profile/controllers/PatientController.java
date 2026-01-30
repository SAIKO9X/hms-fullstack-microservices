package com.hms.profile.controllers;

import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
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
  public ResponseEntity<ApiResponse<PatientResponse>> createPatientProfile(@Valid @RequestBody PatientCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(patientService.createPatientProfile(request), "Perfil de paciente criado."));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<PatientResponse>> getMyProfile(Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(patientService.getPatientProfileByUserId(userId)));
  }

  @PatchMapping
  public ResponseEntity<ApiResponse<PatientResponse>> updateMyProfile(Authentication authentication, @Valid @RequestBody PatientUpdateRequest request) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(patientService.updatePatientProfile(userId, request), "Perfil atualizado."));
  }

  @GetMapping("/exists/{userId}")
  public ResponseEntity<ApiResponse<Boolean>> patientProfileExists(@PathVariable Long userId) {
    return ResponseEntity.ok(ApiResponse.success(patientService.patientProfileExists(userId)));
  }

  @GetMapping("/by-user/{userId}")
  public ResponseEntity<ApiResponse<PatientResponse>> getProfileByUserId(@PathVariable Long userId) {
    return ResponseEntity.ok(ApiResponse.success(patientService.getPatientProfileByUserId(userId)));
  }

  @GetMapping("/dropdown")
  public ResponseEntity<ApiResponse<List<PatientDropdownResponse>>> getPatientsForDropdown() {
    return ResponseEntity.ok(ApiResponse.success(patientService.getPatientsForDropdown()));
  }

  @GetMapping("/all")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<PagedResponse<PatientResponse>>> getAllPatientProfiles(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
    Page<PatientResponse> page = patientService.findAllPatients(pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
  @Auditable(action = "VIEW_PATIENT_PROFILE", resourceName = "PatientProfile")
  public ResponseEntity<ApiResponse<PatientResponse>> getPatientProfileById(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(patientService.getPatientProfileById(id)));
  }

  @PutMapping("/picture")
  public ResponseEntity<ApiResponse<Void>> updatePatientProfilePicture(
    Authentication authentication,
    @Valid @RequestBody ProfilePictureUpdateRequest request
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    patientService.updateProfilePicture(userId, request.pictureUrl());
    return ResponseEntity.ok(ApiResponse.success(null, "Foto de perfil atualizada."));
  }

  @PutMapping("/admin/update/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "ADMIN_UPDATE_PATIENT", resourceName = "PatientProfile")
  public ResponseEntity<ApiResponse<Void>> adminUpdatePatient(
    @PathVariable("userId") Long userId,
    @RequestBody AdminPatientUpdateRequest updateRequest
  ) {
    patientService.adminUpdatePatient(userId, updateRequest);
    return ResponseEntity.ok(ApiResponse.success(null, "Perfil atualizado pelo administrador."));
  }
}