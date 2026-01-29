package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.services.MedicalDocumentService;
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
  public ResponseEntity<MedicalDocumentResponse> uploadDocument(Authentication authentication, @Valid @RequestBody MedicalDocumentCreateRequest request) {
    Long uploaderId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED).body(documentService.createDocument(uploaderId, null, request));
  }

  @GetMapping("/patient")
  @PreAuthorize("hasRole('PATIENT')")
  public ResponseEntity<Page<MedicalDocumentResponse>> getMyDocuments(
    Authentication authentication,
    @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(documentService.getDocumentsByPatientId(patientId, pageable, patientId, "PATIENT"));
  }

  @GetMapping("/patient/{patientId}")
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  @Auditable(action = "VIEW_PATIENT_DOCUMENTS", resourceName = "MEDICAL_DOCUMENT")
  public ResponseEntity<Page<MedicalDocumentResponse>> getDocumentsForPatient(
    @PathVariable Long patientId,
    Authentication authentication,
    @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    String requesterRole = authentication.getAuthorities().stream()
      .findFirst().map(GrantedAuthority::getAuthority).orElse("UNKNOWN");

    return ResponseEntity.ok(documentService.getDocumentsByPatientId(patientId, pageable, requesterId, requesterRole));
  }

  @DeleteMapping("/{id}")
  @Auditable(action = "DELETE_DOCUMENT", resourceName = "MEDICAL_DOCUMENT")
  public ResponseEntity<Void> deleteDocument(@PathVariable Long id, Authentication authentication) {
    Long patientId = SecurityUtils.getUserId(authentication);
    documentService.deleteDocument(id, patientId);
    return ResponseEntity.noContent().build();
  }
}