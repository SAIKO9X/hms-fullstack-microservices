package com.hms.billing.clients;

import com.hms.billing.external.DoctorDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service")
public interface ProfileFeignClient {
  @GetMapping("/doctors/{id}")
  DoctorDTO getDoctor(@PathVariable("id") String id);
}