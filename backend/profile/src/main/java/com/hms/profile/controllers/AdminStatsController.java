package com.hms.profile.controllers;

import com.hms.profile.dto.response.AdminDashboardStatsResponse;
import com.hms.profile.services.DoctorService;
import com.hms.profile.services.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/admin/stats")
public class AdminStatsController {

  private final PatientService patientService;
  private final DoctorService doctorService;

  @GetMapping("/counts")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public AdminDashboardStatsResponse getDashboardCounts() {
    long totalPatients = patientService.countAllPatients();
    long totalDoctors = doctorService.countAllDoctors();
    return new AdminDashboardStatsResponse(totalPatients, totalDoctors);
  }
}