package com.hms.profile.services;

import com.hms.profile.request.PatientCreateRequest;
import com.hms.profile.request.PatientUpdateRequest;
import com.hms.profile.response.PatientDropdownResponse;
import com.hms.profile.response.PatientResponse;

import java.util.List;

public interface PatientService {

  PatientResponse createPatientProfile(PatientCreateRequest request);

  PatientResponse getPatientProfileById(Long profileId);

  PatientResponse getPatientProfileByUserId(Long userId);

  PatientResponse updatePatientProfile(Long userId, PatientUpdateRequest request);

  boolean patientProfileExists(Long userId);

  List<PatientDropdownResponse> getPatientsForDropdown();

  List<PatientResponse> findAllPatients();

  void updateProfilePicture(Long userId, String pictureUrl);
}