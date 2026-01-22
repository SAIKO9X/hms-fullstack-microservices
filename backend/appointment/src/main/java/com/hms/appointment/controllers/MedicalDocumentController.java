package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.services.JwtService;
import com.hms.appointment.services.MedicalDocumentService;
import com.hms.common.security.Auditable;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class MedicalDocumentController {

  private final MedicalDocumentService documentService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Auditable(action = "UPLOAD_DOCUMENT", resourceName = "MEDICAL_DOCUMENT")
  public MedicalDocumentResponse uploadDocument(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody MedicalDocumentCreateRequest request) {
    Long uploaderId = getUserIdFromToken(token);
    return documentService.createDocument(uploaderId, token, request);
  }

  @GetMapping("/patient")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public Page<MedicalDocumentResponse> getMyDocuments(
    @RequestHeader("Authorization") String token,
    @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long patientId = getUserIdFromToken(token);
    return documentService.getDocumentsByPatientId(patientId, pageable, patientId, "PATIENT");
  }

  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  @Auditable(action = "VIEW_PATIENT_DOCUMENTS", resourceName = "MEDICAL_DOCUMENT")
  public Page<MedicalDocumentResponse> getDocumentsForPatient(
    @PathVariable Long patientId,
    @RequestHeader("Authorization") String token,
    @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Long requesterId = getUserIdFromToken(token);
    String requesterRole = jwtService.extractClaim(token.substring(7), claims -> claims.get("role", String.class));

    return documentService.getDocumentsByPatientId(patientId, pageable, requesterId, requesterRole);
  }

  @DeleteMapping("/{id}")
  @Auditable(action = "DELETE_DOCUMENT", resourceName = "MEDICAL_DOCUMENT")
  public ResponseEntity<Void> deleteDocument(
    @PathVariable Long id,
    @RequestHeader("Authorization") String token
  ) {
    Long patientId = getUserIdFromToken(token);
    documentService.deleteDocument(id, patientId);
    return ResponseEntity.noContent().build();
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}