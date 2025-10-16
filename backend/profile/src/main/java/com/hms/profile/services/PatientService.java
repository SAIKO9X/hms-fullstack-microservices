package com.hms.profile.services;

import com.hms.profile.dto.request.AdminPatientUpdateRequest;
import com.hms.profile.dto.request.PatientCreateRequest;
import com.hms.profile.dto.request.PatientUpdateRequest;
import com.hms.profile.dto.response.PatientDropdownResponse;
import com.hms.profile.dto.response.PatientResponse;

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

  void adminUpdatePatient(Long userId, AdminPatientUpdateRequest updateRequest);

  long countAllPatients();
}