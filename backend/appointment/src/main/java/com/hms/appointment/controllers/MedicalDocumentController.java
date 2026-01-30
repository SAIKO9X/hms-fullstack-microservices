package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.services.MedicalDocumentService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class MedicalDocumentController {

  private final MedicalDocumentService documentService;

  @PostMapping
  @Auditable(action = "UPLOAD_DOCUMENT", resourceName = "MEDICAL_DOCUMENT")
  public ResponseEntity<ApiResponse<MedicalDocumentResponse>> uploadDocument(
    Authentication authentication,
    @Valid @RequestBody MedicalDocumentCreateRequest request
  ) {
    Long uploaderId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(documentService.createDocument(uploaderId, null, request), "Documento enviado com sucesso."));
  }

  @GetMapping("/patient")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<ApiResponse<PagedResponse<MedicalDocumentResponse>>> getMyDocuments(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    Page<MedicalDocumentResponse> page = documentService.getDocumentsByPatientId(patientId, pageable, patientId, "PATIENT");
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @GetMapping("/patient/{patientId}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  @Auditable(action = "VIEW_PATIENT_DOCUMENTS", resourceName = "MEDICAL_DOCUMENT")
  public ResponseEntity<ApiResponse<PagedResponse<MedicalDocumentResponse>>> getDocumentsForPatient(
    @PathVariable Long patientId,
    Authentication authentication,
    @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    String requesterRole = authentication.getAuthorities().stream()
      .findFirst().map(GrantedAuthority::getAuthority).orElse("UNKNOWN");

    Page<MedicalDocumentResponse> page = documentService.getDocumentsByPatientId(patientId, pageable, requesterId, requesterRole);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @DeleteMapping("/{id}")
  @Auditable(action = "DELETE_DOCUMENT", resourceName = "MEDICAL_DOCUMENT")
  public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id, Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    documentService.deleteDocument(id, patientId);
    return ResponseEntity.ok(ApiResponse.success(null, "Documento removido."));
  }
}