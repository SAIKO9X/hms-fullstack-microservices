package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentCompleteRequest;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

  private final AppointmentService appointmentService;

  @GetMapping("/{id}")
  @Auditable(action = "VIEW", resourceName = "APPOINTMENT")
  public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(appointmentService.getAppointmentById(id, requesterId));
  }

  @PatchMapping("/{id}/cancel")
  @Auditable(action = "CANCEL", resourceName = "APPOINTMENT")
  public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable Long id, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(appointmentService.cancelAppointment(id, requesterId));
  }

  @PatchMapping("/{id}/reschedule")
  @Auditable(action = "RESCHEDULE", resourceName = "APPOINTMENT")
  public ResponseEntity<AppointmentResponse> rescheduleAppointment(
    @PathVariable Long id,
    @RequestBody @Valid AppointmentUpdateRequest request,
    Authentication authentication
  ) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    LocalDateTime newDateTime = request.appointmentDateTime();
    return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, newDateTime, requesterId));
  }

  @PatchMapping("/{id}/complete")
  @Auditable(action = "COMPLETE", resourceName = "APPOINTMENT")
  public ResponseEntity<AppointmentResponse> completeAppointment(
    @PathVariable Long id,
    @RequestBody @Valid AppointmentCompleteRequest request,
    Authentication authentication
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(appointmentService.completeAppointment(id, request.notes(), doctorId));
  }

  @PostMapping("/waitlist")
  public ResponseEntity<Void> joinWaitlist(Authentication authentication, @RequestBody @Valid AppointmentCreateRequest request) {
    Long patientId = SecurityUtils.getUserId(authentication);
    appointmentService.joinWaitlist(patientId, request);
    return ResponseEntity.status(HttpStatus.CREATED).build();
  }
}