package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
import com.hms.appointment.services.PrescriptionService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

  private final PrescriptionService prescriptionService;

  @PostMapping
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<ApiResponse<PrescriptionResponse>> createPrescription(
    Authentication authentication,
    @Valid @RequestBody PrescriptionCreateRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(prescriptionService.createPrescription(request, doctorId), "Prescrição criada com sucesso."));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionById(@PathVariable Long id, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionByAppointmentId(id, requesterId)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<ApiResponse<PrescriptionResponse>> updatePrescription(
    Authentication authentication,
    @PathVariable Long id,
    @Valid @RequestBody PrescriptionUpdateRequest request
  ) {
    Long doctorId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(prescriptionService.updatePrescription(id, request, doctorId)));
  }

  @GetMapping("/appointment/{appointmentId}")
  public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionByAppointmentId(@PathVariable Long appointmentId, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionByAppointmentId(appointmentId, requesterId)));
  }

  @GetMapping("/patient/{patientId}")
  public ResponseEntity<ApiResponse<PagedResponse<PrescriptionResponse>>> getPrescriptionsByPatientId(
    Authentication authentication,
    @PathVariable Long patientId,
    @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    Page<PrescriptionResponse> page = prescriptionService.getPrescriptionsByPatientId(patientId, requesterId, pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @GetMapping("/patient/my-history")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<ApiResponse<PagedResponse<PrescriptionResponse>>> getMyPrescriptionHistory(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    Page<PrescriptionResponse> page = prescriptionService.getPrescriptionsByPatientId(patientId, patientId, pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @GetMapping("/pharmacy-access/{id}")
  public ResponseEntity<ApiResponse<PrescriptionForPharmacyResponse>> getPrescriptionForPharmacy(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionForPharmacy(id)));
  }

  @GetMapping("/patient/latest")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<ApiResponse<PrescriptionResponse>> getLatestPrescription(Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ApiResponse.success(prescriptionService.getLatestPrescriptionByPatientId(patientId)));
  }

  @GetMapping("/{id}/pdf")
  @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT', 'ADMIN')")
  public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Long id, Authentication authentication) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    byte[] pdfBytes = prescriptionService.generatePrescriptionPdf(id, requesterId);

    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
      .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("receita_" + id + ".pdf").build().toString())
      .body(pdfBytes);
  }
}