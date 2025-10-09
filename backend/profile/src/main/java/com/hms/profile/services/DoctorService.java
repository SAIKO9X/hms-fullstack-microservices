package com.hms.profile.services;

import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;

import java.util.List;

public interface DoctorService {
  DoctorResponse createDoctorProfile(DoctorCreateRequest request);

  DoctorResponse getDoctorProfileByUserId(Long userId);

  DoctorResponse updateDoctorProfile(Long userId, DoctorUpdateRequest request);

  boolean doctorProfileExists(Long userId);

  List<DoctorDropdownResponse> getDoctorsForDropdown();

  List<DoctorResponse> findAllDoctors();

  DoctorResponse getDoctorProfileById(Long id);

  void updateProfilePicture(Long userId, String pictureUrl);

  List<DoctorStatusResponse> getDoctorsWithStatus();

  long countAllDoctors();
}