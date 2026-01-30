package com.hms.profile.clients;

import com.hms.common.config.FeignClientInterceptor;
import com.hms.profile.dto.response.AppointmentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "appointment-service", configuration = FeignClientInterceptor.class)
public interface AppointmentFeignClient {

  @GetMapping("/admin/stats/active-doctors")
  List<Long> getActiveDoctorIds();

  @GetMapping("/patient/appointments/history/{patientId}")
  List<AppointmentResponse> getAppointmentHistoryForPatient(@PathVariable("patientId") Long patientId);

  @GetMapping("/appointments/{id}")
  AppointmentResponse getAppointmentById(@PathVariable("id") Long id);
}