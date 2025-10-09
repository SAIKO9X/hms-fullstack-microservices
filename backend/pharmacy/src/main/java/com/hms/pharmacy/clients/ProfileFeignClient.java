package com.hms.pharmacy.clients;

import com.hms.pharmacy.dto.response.PatientProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", path = "/profile")
public interface ProfileFeignClient {

  @GetMapping("/patients/by-user/{userId}")
  PatientProfileResponse getPatientProfileByUserId(@PathVariable("userId") Long userId);
}