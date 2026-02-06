package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentCompleteRequest;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

  private final AppointmentService appointmentService;

  @GetMapping("/{id}")
  @Auditable(action = "VIEW", resourceName = "APPOINTMENT")
  public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Long id, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id, requesterId)));
  }

  @PatchMapping("/{id}/cancel")
  @Auditable(action = "CANCEL", resourceName = "APPOINTMENT")
  public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(@PathVariable Long id, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    AppointmentResponse response = appointmentService.cancelAppointment(id, requesterId);
    return ResponseEntity.ok(ApiResponse.success(response, "Consulta cancelada com sucesso."));
  }

  @PatchMapping("/{id}/reschedule")
  @Auditable(action = "RESCHEDULE", resourceName = "APPOINTMENT")
  public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
    @PathVariable Long id,
    @RequestBody @Valid AppointmentUpdateRequest request,
    Authentication authentication
  ) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    LocalDateTime newDateTime = request.appointmentDateTime();
    AppointmentResponse response = appointmentService.rescheduleAppointment(id, newDateTime, requesterId);
    return ResponseEntity.ok(ApiResponse.success(response, "Consulta reagendada com sucesso."));
  }

  @PatchMapping("/{id}/complete")
  @Auditable(action = "COMPLETE", resourceName = "APPOINTMENT")
  public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
    @PathVariable Long id,
    @RequestBody @Valid AppointmentCompleteRequest request,
    Authentication authentication
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    AppointmentResponse response = appointmentService.completeAppointment(id, request.notes(), doctorId);
    return ResponseEntity.ok(ApiResponse.success(response, "Consulta finalizada com sucesso."));
  }

  @PostMapping("/waitlist")
  public ResponseEntity<ApiResponse<Void>> joinWaitlist(Authentication authentication, @RequestBody @Valid AppointmentCreateRequest request) {
    Long patientId = SecurityUtils.getUserId(authentication);
    appointmentService.joinWaitlist(patientId, request);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(null, "Adicionado à lista de espera."));
  }

  @GetMapping("/history/patient/{patientId}")
  public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentHistory(@PathVariable Long patientId) {
    return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByPatientId(patientId)));
  }
}