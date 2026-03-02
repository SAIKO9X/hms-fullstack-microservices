package com.hms.profile.controllers;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.common.security.Auditable;
import com.hms.profile.docs.MedicalHistoryControllerDocs;
import com.hms.profile.dto.response.MedicalHistoryResponse;
import com.hms.profile.services.MedicalHistoryService;
import com.hms.profile.services.PatientService;
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
public class MedicalHistoryController implements MedicalHistoryControllerDocs {

  private final MedicalHistoryService medicalHistoryService;
  private final PatientService patientService;

  @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
  @GetMapping("/patient/medical-history/{patientProfileId}")
  public ResponseEntity<ResponseWrapper<MedicalHistoryResponse>> getMedicalHistory(@PathVariable Long patientProfileId) {
    return ResponseEntity.ok(
      ResponseWrapper.success(medicalHistoryService.getPatientMedicalHistory(patientProfileId))
    );
  }

  @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
  @GetMapping("/patient/medical-history/by-user/{userId}")
  public ResponseEntity<ResponseWrapper<MedicalHistoryResponse>> getMedicalHistoryByUserId(@PathVariable Long userId) {
    Long patientProfileId = patientService.getPatientProfileByUserId(userId).id();
    return ResponseEntity.ok(
      ResponseWrapper.success(medicalHistoryService.getPatientMedicalHistory(patientProfileId))
    );
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/admin/patient/{patientProfileId}/medical-history")
  @Auditable(action = "VIEW_MEDICAL_HISTORY_ADMIN", resourceName = "MedicalHistory")
  public ResponseEntity<ResponseWrapper<MedicalHistoryResponse>> getPatientMedicalHistoryByIdForAdmin(@PathVariable Long patientProfileId) {
    return ResponseEntity.ok(
      ResponseWrapper.success(medicalHistoryService.getMedicalHistoryByPatientProfileId(patientProfileId))
    );
  }
}
