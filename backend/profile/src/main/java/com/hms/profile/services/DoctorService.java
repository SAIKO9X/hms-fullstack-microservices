package com.hms.profile.services;

import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorService {
  DoctorResponse createDoctorProfile(DoctorCreateRequest request);

  DoctorResponse getDoctorProfileByUserId(Long userId);

  DoctorResponse updateDoctorProfile(Long userId, DoctorUpdateRequest request);

  boolean doctorProfileExists(Long userId);

  List<DoctorDropdownResponse> getDoctorsForDropdown();

  Page<DoctorResponse> findAllDoctors(Pageable pageable);

  DoctorResponse getDoctorProfileById(Long id);

  void updateProfilePicture(Long userId, String pictureUrl);

  List<DoctorStatusResponse> getDoctorsWithStatus();

  void adminUpdateDoctor(Long userId, AdminDoctorUpdateRequest updateRequest);

  long countAllDoctors();
}