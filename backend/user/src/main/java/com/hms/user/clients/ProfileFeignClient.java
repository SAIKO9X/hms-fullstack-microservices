package com.hms.user.clients;

import com.hms.user.request.DoctorCreateRequest;
import com.hms.user.request.PatientCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "profile-service", path = "/profile")
public interface ProfileFeignClient {

  @PostMapping("/patients")
  void createPatientProfile(@RequestBody PatientCreateRequest request);

  @PostMapping("/doctors")
  void createDoctorProfile(@RequestBody DoctorCreateRequest request);
}