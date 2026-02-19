package com.hms.billing.clients;

import com.hms.billing.dto.external.DoctorDTO;
import com.hms.billing.dto.external.PatientDTO;
import com.hms.common.config.FeignClientInterceptor;
import com.hms.common.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", configuration = FeignClientInterceptor.class)
public interface ProfileFeignClient {
  @GetMapping("/profile/patients/{id}")
  ApiResponse<PatientDTO> getPatient(@PathVariable("id") Long id);

  @GetMapping("/profile/doctors/{id}")
  ApiResponse<DoctorDTO> getDoctor(@PathVariable("id") Long id);

  @GetMapping("/profile/patients/user/{userId}")
  ApiResponse<PatientDTO> getPatientByUserId(@PathVariable("userId") Long userId);

  @GetMapping("/profile/doctors/user/{userId}")
  ApiResponse<DoctorDTO> getDoctorByUserId(@PathVariable("userId") Long userId);
}