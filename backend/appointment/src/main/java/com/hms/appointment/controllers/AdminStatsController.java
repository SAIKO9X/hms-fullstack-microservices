package com.hms.appointment.controllers;

import com.hms.appointment.dto.response.DailyActivityDto;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/stats")
public class AdminStatsController {

  private final AppointmentService appointmentService;
  private final AppointmentRepository appointmentRepository;

  @GetMapping("/appointments-today")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Long> getAppointmentsTodayCount() {
    return ResponseEntity.ok(appointmentService.countAllAppointmentsForToday());
  }

  @GetMapping("/daily-activity")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
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
}