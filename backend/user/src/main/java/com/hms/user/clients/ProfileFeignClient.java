package com.hms.user.clients;

import com.hms.user.dto.request.AdminDoctorUpdateRequest;
import com.hms.user.dto.request.AdminPatientUpdateRequest;
import com.hms.user.dto.request.DoctorCreateRequest;
import com.hms.user.dto.request.PatientCreateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "profile-service", path = "/profile")
public interface ProfileFeignClient {

  @PostMapping("/patients")
  void createPatientProfile(@RequestBody PatientCreateRequest request);

  @PostMapping("/doctors")
  void createDoctorProfile(@RequestBody DoctorCreateRequest request);

  @PutMapping("/patients/admin/update/{id}")
  void adminUpdatePatient(@PathVariable("id") Long id, @RequestBody AdminPatientUpdateRequest request);

  @PutMapping("/doctors/admin/update/{id}")
  void adminUpdateDoctor(@PathVariable("id") Long id, @RequestBody AdminDoctorUpdateRequest request);
}