package com.hms.profile.controllers;

import com.hms.profile.dto.response.AdminDashboardStatsResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;
import com.hms.profile.services.DoctorService;
import com.hms.profile.services.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/profile/admin/stats")
public class AdminStatsController {

  private final PatientService patientService;
  private final DoctorService doctorService;

  @GetMapping("/counts")
  public ResponseEntity<AdminDashboardStatsResponse> getDashboardCounts() {
    long totalPatients = patientService.countAllPatients();
    long totalDoctors = doctorService.countAllDoctors();
    return ResponseEntity.ok(new AdminDashboardStatsResponse(totalPatients, totalDoctors));
  }

  @GetMapping("/doctors-status")
  public ResponseEntity<List<DoctorStatusResponse>> getDoctorsStatus() {
    return ResponseEntity.ok(doctorService.getDoctorsWithStatus());
  }
}