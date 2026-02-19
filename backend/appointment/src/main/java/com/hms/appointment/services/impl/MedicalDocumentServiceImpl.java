package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.entities.MedicalDocument;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.MedicalDocumentRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.appointment.services.MedicalDocumentService;
import com.hms.common.audit.AuditChangeTracker;
import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceNotFoundException;
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
  private final DoctorReadModelRepository doctorReadModelRepository;
  private final PatientReadModelRepository patientReadModelRepository;

  @Override
  @Transactional
  public MedicalDocumentResponse createDocument(Long uploaderId, String uploaderRole, MedicalDocumentCreateRequest request) {
    if ("PATIENT".equalsIgnoreCase(uploaderRole)) {
      PatientReadModel patient = patientReadModelRepository.findByUserId(uploaderId)
        .orElseThrow(() -> new ResourceNotFoundException("Patient Profile", uploaderId));

      if (!patient.getPatientId().equals(request.patientId())) {
        throw new AccessDeniedException("Acesso negado. Pacientes só podem enviar documentos para si mesmos.");
      }
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
        throw new AccessDeniedException("Acesso negado. Você não possui vínculo (consulta agendada ou histórico) com este paciente.");
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
      .orElseThrow(() -> new ResourceNotFoundException("Medical Document", documentId));

    if (!document.getPatientId().equals(patientId)) {
      throw new AccessDeniedException("Acesso negado. Você não tem permissão para apagar este documento.");
    }

    AuditChangeTracker.addChange("documentName", document.getDocumentName(), "DELETED");
    AuditChangeTracker.addChange("mediaUrl", document.getMediaUrl(), "DELETED");
    AuditChangeTracker.addChange("documentType", document.getDocumentType(), "DELETED");

    documentRepository.delete(document);
  }

  private void validateMediaSecurity(String mediaUrl) {
    if (mediaUrl == null || mediaUrl.trim().isEmpty()) {
      throw new InvalidOperationException("A URL do documento não pode ser vazia.");
    }

    if (!mediaUrl.startsWith("http://") && !mediaUrl.startsWith("https://")) {
      log.warn("Tentativa de upload com protocolo inválido: {}", mediaUrl);
      throw new InvalidOperationException("Formato de URL inválido. Apenas links HTTP/HTTPS são permitidos.");
    }

    String lowerUrl = mediaUrl.toLowerCase();
    if (lowerUrl.endsWith(".exe") || lowerUrl.endsWith(".sh") || lowerUrl.endsWith(".bat") || lowerUrl.endsWith(".php")) {
      log.error("Bloqueio de segurança: Tentativa de vincular arquivo executável: {}", mediaUrl);
      throw new InvalidOperationException("Este tipo de arquivo é estritamente proibido por políticas de segurança.");
    }
  }
}