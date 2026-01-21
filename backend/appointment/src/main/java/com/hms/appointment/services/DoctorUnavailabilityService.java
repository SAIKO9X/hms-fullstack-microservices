package com.hms.appointment.services;

import com.hms.appointment.dto.request.DoctorUnavailabilityRequest;
import com.hms.appointment.dto.response.DoctorUnavailabilityResponse;

import java.util.List;

public interface DoctorUnavailabilityService {
  DoctorUnavailabilityResponse createUnavailability(DoctorUnavailabilityRequest request);

  List<DoctorUnavailabilityResponse> getUnavailabilityByDoctor(Long doctorId);

  void deleteUnavailability(Long id);
}