package com.hms.profile.controllers;

import com.hms.profile.dto.response.MedicalHistoryResponse;
import com.hms.profile.services.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/profile/patients/{id}/medical-history")
@RequiredArgsConstructor
public class MedicalHistoryController {

  private final MedicalHistoryService medicalHistoryService;

  @GetMapping
  public ResponseEntity<MedicalHistoryResponse> getMedicalHistory(@PathVariable Long id) {
    MedicalHistoryResponse history = medicalHistoryService.getPatientMedicalHistory(id);
    return ResponseEntity.ok(history);
  }
}