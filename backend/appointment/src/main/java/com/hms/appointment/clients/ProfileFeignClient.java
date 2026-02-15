package com.hms.appointment.clients;

import com.hms.appointment.dto.external.DoctorProfile;
import com.hms.appointment.dto.external.PatientProfile;
import com.hms.common.config.FeignClientInterceptor;
import com.hms.common.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", configuration = FeignClientInterceptor.class)
public interface ProfileFeignClient {

  @GetMapping("/profile/doctors/{id}")
  DoctorProfile getDoctor(@PathVariable("id") Long id);

  @GetMapping("/profile/patients/{id}")
  PatientProfile getPatient(@PathVariable("id") Long id);

  @GetMapping("/profile/patients/by-user/{userId}")
  ApiResponse<PatientProfile> getPatientByUserId(@PathVariable("userId") Long userId);
}