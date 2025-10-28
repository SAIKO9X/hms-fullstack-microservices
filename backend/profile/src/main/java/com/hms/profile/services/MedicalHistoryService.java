package com.hms.profile.services;

import com.hms.profile.dto.response.MedicalHistoryResponse;

public interface MedicalHistoryService {
  MedicalHistoryResponse getPatientMedicalHistory(Long patientId);

  MedicalHistoryResponse getMedicalHistoryByPatientProfileId(Long patientProfileId);
}