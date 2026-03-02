package com.hms.appointment.controllers;

import com.hms.appointment.docs.AppointmentRecordControllerDocs;
import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.appointment.services.AppointmentRecordService;
import com.hms.common.dto.response.ResponseWrapper;
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
public class AppointmentRecordController implements AppointmentRecordControllerDocs {

  private final AppointmentRecordService recordService;

  @PostMapping
  @Auditable(action = "CREATE", resourceName = "APPOINTMENT_RECORD")
  public ResponseEntity<ResponseWrapper<AppointmentRecordResponse>> createRecord(
    Authentication authentication,
    @Valid @RequestBody AppointmentRecordCreateRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    AppointmentRecordResponse response = recordService.createAppointmentRecord(request, doctorId);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(response, "Prontuário criado com sucesso."));
  }

  @GetMapping("/appointment/{appointmentId}")
  public ResponseEntity<ResponseWrapper<AppointmentRecordResponse>> getRecordByAppointmentId(Authentication authentication, @PathVariable Long appointmentId) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(recordService.getAppointmentRecordByAppointmentId(appointmentId, requesterId)));
  }

  @PutMapping("/{recordId}")
  @Auditable(action = "UPDATE", resourceName = "APPOINTMENT_RECORD")
  public ResponseEntity<ResponseWrapper<AppointmentRecordResponse>> updateRecord(
    Authentication authentication,
    @PathVariable Long recordId,
    @Valid @RequestBody AppointmentRecordUpdateRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(recordService.updateAppointmentRecord(recordId, request, doctorId)));
  }
}