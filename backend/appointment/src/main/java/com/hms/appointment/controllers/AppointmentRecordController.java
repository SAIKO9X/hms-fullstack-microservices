package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.appointment.services.AppointmentRecordService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/records")
public class AppointmentRecordController {

  private final AppointmentRecordService recordService;

  @PostMapping
  @Auditable(action = "CREATE", resourceName = "APPOINTMENT_RECORD")
  public ResponseEntity<ApiResponse<AppointmentRecordResponse>> createRecord(
    Authentication authentication,
    @Valid @RequestBody AppointmentRecordCreateRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    AppointmentRecordResponse response = recordService.createAppointmentRecord(request, doctorId);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(response, "Prontuário criado com sucesso."));
  }

  @GetMapping("/appointment/{appointmentId}")
  public ResponseEntity<ApiResponse<AppointmentRecordResponse>> getRecordByAppointmentId(Authentication authentication, @PathVariable Long appointmentId) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(recordService.getAppointmentRecordByAppointmentId(appointmentId, requesterId)));
  }

  @PutMapping("/{recordId}")
  @Auditable(action = "UPDATE", resourceName = "APPOINTMENT_RECORD")
  public ResponseEntity<ApiResponse<AppointmentRecordResponse>> updateRecord(
    Authentication authentication,
    @PathVariable Long recordId,
    @Valid @RequestBody AppointmentRecordUpdateRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(recordService.updateAppointmentRecord(recordId, request, doctorId)));
  }
}