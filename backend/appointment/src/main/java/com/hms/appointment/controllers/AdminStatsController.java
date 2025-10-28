package com.hms.appointment.controllers;

import com.hms.appointment.dto.response.AppointmentDetailResponse;
import com.hms.appointment.dto.response.DailyActivityDto;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/admin/stats")
public class AdminStatsController {

  private final AppointmentService appointmentService;
  private final AppointmentRepository appointmentRepository;

  @GetMapping("/appointments-today")
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<Long> getAppointmentsTodayCount() {
    return ResponseEntity.ok(appointmentService.countAllAppointmentsForToday());
  }

  @GetMapping("/daily-activity")
  @ResponseStatus(HttpStatus.OK)
  public List<DailyActivityDto> getDailyActivity() {
    return appointmentService.getDailyActivityStats();
  }

  @GetMapping("/active-doctors")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
  public List<Long> getActiveDoctorIds() {
    LocalDateTime now = LocalDateTime.now();
    // Considera um médico "ativo" se tiver uma consulta que começou na última hora e ainda não terminou
    LocalDateTime oneHourAgo = now.minusHours(1);
    return appointmentRepository.findByAppointmentDateTimeBetween(oneHourAgo, now)
      .stream()
      .map(Appointment::getDoctorId)
      .distinct()
      .collect(Collectors.toList());
  }

  @GetMapping("/by-doctor/{doctorId}")
  @ResponseStatus(HttpStatus.OK)
  public List<AppointmentDetailResponse> getAppointmentDetailsForDoctorById(
    @PathVariable Long doctorId,
    @RequestParam(name = "date", required = false) String dateFilter
  ) {
    return appointmentService.getAppointmentDetailsForDoctor(doctorId, dateFilter);
  }
}