package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.services.JwtService;
import com.hms.appointment.services.MedicalDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/documents")
public class MedicalDocumentController {

  private final MedicalDocumentService documentService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
  public MedicalDocumentResponse uploadDocument(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody MedicalDocumentCreateRequest request) {
    Long uploaderId = getUserIdFromToken(token);
    // Passa o token completo para o serviço poder extrair a role
    return documentService.createDocument(uploaderId, token, request);
  }

  @GetMapping("/patient")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('PATIENT')")
  public List<MedicalDocumentResponse> getMyDocuments(@RequestHeader("Authorization") String token) {
    Long patientId = getUserIdFromToken(token);
    return documentService.getDocumentsByPatientId(patientId);
  }

  // Endpoint para médicos ou admins verem documentos de um paciente específico
  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
  public List<MedicalDocumentResponse> getDocumentsForPatient(@PathVariable Long patientId) {
    return documentService.getDocumentsByPatientId(patientId);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('PATIENT')")
  public void deleteDocument(@RequestHeader("Authorization") String token, @PathVariable Long id) {
    Long patientId = getUserIdFromToken(token);
    documentService.deleteDocument(id, patientId);
  }

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}