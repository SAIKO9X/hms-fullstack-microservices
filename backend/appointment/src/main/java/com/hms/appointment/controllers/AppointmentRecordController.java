package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.appointment.services.AppointmentRecordService;
import com.hms.appointment.services.JwtService;
import com.hms.common.security.Auditable;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/records")
public class AppointmentRecordController {

  private final AppointmentRecordService recordService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Auditable(action = "CREATE", resourceName = "APPOINTMENT_RECORD")
  public AppointmentRecordResponse createRecord(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody AppointmentRecordCreateRequest request) {
    Long doctorId = getUserIdFromToken(token);
    return recordService.createAppointmentRecord(request, doctorId);
  }

  @GetMapping("/appointment/{appointmentId}")
  @ResponseStatus(HttpStatus.OK)
  public AppointmentRecordResponse getRecordByAppointmentId(
    @RequestHeader("Authorization") String token,
    @PathVariable Long appointmentId) {
    Long requesterId = getUserIdFromToken(token);
    return recordService.getAppointmentRecordByAppointmentId(appointmentId, requesterId);
  }

  @PutMapping("/{recordId}")
  @ResponseStatus(HttpStatus.OK)
  @Auditable(action = "UPDATE", resourceName = "APPOINTMENT_RECORD")
  public AppointmentRecordResponse updateRecord(
    @RequestHeader("Authorization") String token,
    @PathVariable Long recordId,
    @Valid @RequestBody AppointmentRecordUpdateRequest request
  ) {
    Long doctorId = getUserIdFromToken(token);
    return recordService.updateAppointmentRecord(recordId, request, doctorId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}