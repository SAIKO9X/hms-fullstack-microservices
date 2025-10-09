package com.hms.profile.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "appointment-service", path = "/admin/stats")
public interface AppointmentFeignClient {

  @GetMapping("/active-doctors")
  List<Long> getActiveDoctorIds();
}