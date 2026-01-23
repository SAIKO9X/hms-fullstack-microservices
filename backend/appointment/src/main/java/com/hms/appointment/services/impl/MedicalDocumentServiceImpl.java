package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.entities.MedicalDocument;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.MedicalDocumentRepository;
import com.hms.appointment.services.JwtService;
import com.hms.appointment.services.MedicalDocumentService;
import com.hms.common.audit.AuditChangeTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalDocumentServiceImpl implements MedicalDocumentService {

  private final MedicalDocumentRepository documentRepository;
  private final AppointmentRepository appointmentRepository;
  private final JwtService jwtService;

  @Override
  public MedicalDocumentResponse createDocument(Long uploaderId, String token, MedicalDocumentCreateRequest request) {
    String role = jwtService.extractClaim(token.substring(7), claims -> claims.get("role", String.class));

    if ("PATIENT".equals(role) && !uploaderId.equals(request.patientId())) {
      throw new SecurityException("Acesso negado. Pacientes só podem enviar documentos para si mesmos.");
    }

    validateMediaSecurity(request.mediaUrl());

    MedicalDocument document = new MedicalDocument();
    document.setPatientId(request.patientId());
    document.setUploadedByUserId(uploaderId);
    document.setAppointmentId(request.appointmentId());
    document.setDocumentName(request.documentName());
    document.setDocumentType(request.documentType());
    document.setMediaUrl(request.mediaUrl());
    document.setVerified(true);

    MedicalDocument savedDocument = documentRepository.save(document);

    AuditChangeTracker.addChange("documentId", null, savedDocument.getId());
    AuditChangeTracker.addChange("documentName", null, savedDocument.getDocumentName());
    AuditChangeTracker.addChange("documentType", null, savedDocument.getDocumentType());
    AuditChangeTracker.addChange("uploadedBy", null, uploaderId);

    return MedicalDocumentResponse.fromEntity(savedDocument);
  }

  @Override
  public Page<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId, Pageable pageable, Long requesterId, String requesterRole) {

    if ("DOCTOR".equals(requesterRole)) {
      boolean hasRelationship = appointmentRepository.existsByDoctorIdAndPatientId(requesterId, patientId);

      if (!hasRelationship) {
        throw new SecurityException("Acesso negado. Você não possui vínculo (consulta agendada ou histórico) com este paciente para visualizar seus documentos.");
      }
    }

    return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId, pageable)
      .map(MedicalDocumentResponse::fromEntity);
  }

  @Override
  public Page<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId, Pageable pageable) {
    return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId, pageable)
      .map(MedicalDocumentResponse::fromEntity);
  }

  @Override
  @Transactional
  public void deleteDocument(Long documentId, Long patientId) {
    MedicalDocument document = documentRepository.findById(documentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Documento com ID " + documentId + " não encontrado."));

    if (!document.getPatientId().equals(patientId)) {
      throw new SecurityException("Acesso negado. Você não tem permissão para apagar este documento.");
    }

    // grava o que foi perdido para fins de auditoria forense se necessário
    AuditChangeTracker.addChange("documentName", document.getDocumentName(), "DELETED");
    AuditChangeTracker.addChange("mediaUrl", document.getMediaUrl(), "DELETED");
    AuditChangeTracker.addChange("documentType", document.getDocumentType(), "DELETED");

    documentRepository.delete(document);
  }

  // Método de validação de segurança para URLs de mídia (simulado)
  private void validateMediaSecurity(String mediaUrl) {
    // validações básicas de segurança para URLs de mídia
    if (mediaUrl == null || mediaUrl.trim().isEmpty()) {
      throw new SecurityException("A URL do documento não pode ser vazia.");
    }

    // garante que é uma URL http/https e não um caminho de sistema de arquivos local (ex: file://, C:/)
    if (!mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
      log.warn("Tentativa de upload com protocolo inválido: {}", mediaUrl);
      throw new SecurityException("Formato de URL inválido. Apenas links HTTP/HTTPS são permitidos.");
    }

    // bloqueia extensões de arquivos potencialmente perigosas
    String lowerUrl = mediaUrl.toLowerCase();
    if (lowerUrl.endsWith(".exe") || lowerUrl.endsWith(".sh") || lowerUrl.endsWith(".bat") || lowerUrl.endsWith(".php")) {
      log.error("Bloqueio de segurança: Tentativa de vincular arquivo executável: {}", mediaUrl);
      throw new SecurityException("Este tipo de arquivo é estritamente proibido por políticas de segurança.");
    }

    log.info("Verificação de segurança preliminar aprovada para: {}", mediaUrl);
  }
}