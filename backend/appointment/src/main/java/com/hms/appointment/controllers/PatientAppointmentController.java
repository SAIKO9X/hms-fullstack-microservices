package com.hms.appointment.controllers;

import com.hms.appointment.docs.PatientAppointmentControllerDocs;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.dto.response.AppointmentStatsResponse;
import com.hms.appointment.repositories.DoctorSummaryProjection;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments/patient")
@RequiredArgsConstructor
public class PatientAppointmentController implements PatientAppointmentControllerDocs {

  private final AppointmentService appointmentService;

  @PostMapping
  public ResponseEntity<ResponseWrapper<AppointmentResponse>> createAppointment(
    Authentication authentication,
    @Valid @RequestBody AppointmentCreateRequest request
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(appointmentService.createAppointment(patientId, request), "Consulta agendada."));
  }

  @GetMapping("/my-doctors")
  public ResponseEntity<ResponseWrapper<List<DoctorSummaryProjection>>> getMyDoctors(Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getMyDoctors(patientId)));
  }

  @GetMapping
  public ResponseEntity<ResponseWrapper<PagedResponse<AppointmentResponse>>> getMyAppointments(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "appointmentDateTime", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    Page<AppointmentResponse> page = appointmentService.getAppointmentsForPatient(patientId, pageable);
    return ResponseEntity.ok(ResponseWrapper.success(PagedResponse.of(page)));
  }

  @GetMapping("/next")
  public ResponseEntity<ResponseWrapper<AppointmentResponse>> getNextAppointment(Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getNextAppointmentForPatient(patientId)));
  }

  @GetMapping("/stats")
  public ResponseEntity<ResponseWrapper<AppointmentStatsResponse>> getAppointmentStats(Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(appointmentService.getAppointmentStatsForPatient(patientId)));
  }
}