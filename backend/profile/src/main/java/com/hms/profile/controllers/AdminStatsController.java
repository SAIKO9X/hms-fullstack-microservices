package com.hms.profile.controllers;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.profile.docs.AdminStatsControllerDocs;
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
public class AdminStatsController implements AdminStatsControllerDocs {

  private final PatientService patientService;
  private final DoctorService doctorService;

  @GetMapping("/counts")
  public ResponseEntity<ResponseWrapper<AdminDashboardStatsResponse>> getDashboardCounts() {
    long totalPatients = patientService.countAllPatients();
    long totalDoctors = doctorService.countAllDoctors();
    return ResponseEntity.ok(ResponseWrapper.success(new AdminDashboardStatsResponse(totalPatients, totalDoctors)));
  }

  @GetMapping("/doctors-status")
  public ResponseEntity<ResponseWrapper<List<DoctorStatusResponse>>> getDoctorsStatus() {
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.getDoctorsWithStatus()));
  }
}