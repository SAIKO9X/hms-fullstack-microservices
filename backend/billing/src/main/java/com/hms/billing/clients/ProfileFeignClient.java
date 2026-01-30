package com.hms.billing.clients;

import com.hms.billing.dto.external.DoctorDTO;
import com.hms.billing.dto.external.PatientDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service", configuration = FeignClientInterceptor.class)
public interface ProfileFeignClient {

  @GetMapping("/profile/doctors/{id}")
  DoctorDTO getDoctor(@PathVariable("id") String id);

  @GetMapping("/profile/patients/{id}")
  PatientDTO getPatient(@PathVariable("id") String id);
}