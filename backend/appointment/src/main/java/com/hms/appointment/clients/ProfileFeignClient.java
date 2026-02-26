package com.hms.appointment.clients;

import com.hms.appointment.dto.external.DoctorProfile;
import com.hms.appointment.dto.external.PatientProfile;
import com.hms.common.config.FeignClientInterceptor;
import com.hms.common.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
  name = "profile-service",
  url = "${feign.profile-service.url:}",
  configuration = FeignClientInterceptor.class
)
public interface ProfileFeignClient {

  @GetMapping("/profile/doctors/by-user/{userId}")
  ApiResponse<DoctorProfile> getDoctorByUserId(@PathVariable("userId") Long userId);

  @GetMapping("/profile/doctors/{id}")
  ApiResponse<DoctorProfile> getDoctor(@PathVariable("id") Long id);

  @GetMapping("/profile/patients/{id}")
  PatientProfile getPatient(@PathVariable("id") Long id);

  @GetMapping("/profile/patients/by-user/{userId}")
  ApiResponse<PatientProfile> getPatientByUserId(@PathVariable("userId") Long userId);

  @GetMapping("/api/patients/{id}")
  PatientProfile getPatientById(@PathVariable("id") Long id);
}