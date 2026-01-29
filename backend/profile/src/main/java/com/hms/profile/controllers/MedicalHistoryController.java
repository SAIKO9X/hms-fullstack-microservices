package com.hms.profile.controllers;

import com.hms.common.security.Auditable;
import com.hms.profile.dto.response.MedicalHistoryResponse;
import com.hms.profile.services.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class MedicalHistoryController {

  private final MedicalHistoryService medicalHistoryService;

  @PreAuthorize("hasRole('PATIENT')")
  @GetMapping("/patient/medical-history/{patientProfileId}")
  public ResponseEntity<MedicalHistoryResponse> getMedicalHistory(@PathVariable Long patientProfileId) {
    return ResponseEntity.ok(medicalHistoryService.getPatientMedicalHistory(patientProfileId));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin/patient/{patientProfileId}/medical-history")
  @Auditable(action = "VIEW_MEDICAL_HISTORY_ADMIN", resourceName = "MedicalHistory")
  public ResponseEntity<MedicalHistoryResponse> getPatientMedicalHistoryByIdForAdmin(@PathVariable Long patientProfileId) {
    return ResponseEntity.ok(medicalHistoryService.getMedicalHistoryByPatientProfileId(patientProfileId));
  }
}