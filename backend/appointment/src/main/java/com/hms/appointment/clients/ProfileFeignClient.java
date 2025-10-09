package com.hms.appointment.clients;

import com.hms.appointment.dto.response.DoctorProfileResponse;
import com.hms.appointment.dto.response.PatientProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", path = "/profile")
public interface ProfileFeignClient {

  @GetMapping("/patients/exists/{userId}")
  boolean patientProfileExists(@PathVariable("userId") Long userId);

  @GetMapping("/doctors/exists/{userId}")
  boolean doctorProfileExists(@PathVariable("userId") Long userId);

  @GetMapping("/patients/by-user/{userId}")
  PatientProfileResponse getPatientProfile(@PathVariable("userId") Long userId);

  @GetMapping("/doctors/by-user/{userId}")
  DoctorProfileResponse getDoctorProfile(@PathVariable("userId") Long userId);
}
