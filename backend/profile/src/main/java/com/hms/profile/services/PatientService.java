package com.hms.profile.services;

import com.hms.profile.request.PatientCreateRequest;
import com.hms.profile.request.PatientUpdateRequest;
import com.hms.profile.response.PatientResponse;

public interface PatientService {

  PatientResponse createPatientProfile(PatientCreateRequest request);

  PatientResponse getPatientProfileById(Long profileId);

  PatientResponse getPatientProfileByUserId(Long userId);

  PatientResponse updatePatientProfile(Long userId, PatientUpdateRequest request);

  boolean patientProfileExists(Long userId);

  List<PatientDropdownResponse> getPatientsForDropdown();
}