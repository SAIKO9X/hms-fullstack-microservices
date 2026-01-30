package com.hms.appointment.controllers;

import com.hms.appointment.dto.response.AppointmentDetailResponse;
import com.hms.appointment.dto.response.DailyActivityDto;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/admin/stats")
public class AdminStatsController {

  private final AppointmentService appointmentService;

  @GetMapping("/appointments-today")
  public ResponseEntity<ApiResponse<Long>> getAppointmentsTodayCount() {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.countAllAppointmentsForToday()));
  }

  @GetMapping("/daily-activity")
  public ResponseEntity<ApiResponse<List<DailyActivityDto>>> getDailyActivity() {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getDailyActivityStats()));
  }

  @GetMapping("/active-doctors")
  @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
  public ResponseEntity<ApiResponse<List<Long>>> getActiveDoctorIds() {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getActiveDoctorIdsInLastHour()));
  }

  @GetMapping("/by-doctor/{doctorId}")
  public ResponseEntity<ApiResponse<List<AppointmentDetailResponse>>> getAppointmentDetailsForDoctorById(
    @PathVariable Long doctorId,
    @RequestParam(name = "date", required = false) String dateFilter
  ) {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentDetailsForDoctor(doctorId, dateFilter)));
  }
}