package com.hms.profile.services;

import com.hms.profile.request.DoctorCreateRequest;
import com.hms.profile.request.DoctorUpdateRequest;
import com.hms.profile.response.DoctorDropdownResponse;
import com.hms.profile.response.DoctorResponse;

import java.util.List;

public interface DoctorService {
  DoctorResponse createDoctorProfile(DoctorCreateRequest request);

  DoctorResponse getDoctorProfileByUserId(Long userId);

  DoctorResponse updateDoctorProfile(Long userId, DoctorUpdateRequest request);

  boolean doctorProfileExists(Long userId);

  List<DoctorDropdownResponse> getDoctorsForDropdown();
}