package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import com.hms.appointment.entities.MedicalDocument;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.MedicalDocumentRepository;
import com.hms.appointment.services.JwtService;
import com.hms.appointment.services.MedicalDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    MedicalDocument document = new MedicalDocument();
    document.setPatientId(request.patientId());
    document.setUploadedByUserId(uploaderId);
    document.setAppointmentId(request.appointmentId());
    document.setDocumentName(request.documentName());
    document.setDocumentType(request.documentType());
    document.setMediaUrl(request.mediaUrl());

    MedicalDocument savedDocument = documentRepository.save(document);
    return MedicalDocumentResponse.fromEntity(savedDocument);
  }

  // Assinatura do método alterada para receber quem está solicitando
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
  public void deleteDocument(Long documentId, Long patientId) {
    MedicalDocument document = documentRepository.findById(documentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Documento com ID " + documentId + " não encontrado."));

    if (!document.getPatientId().equals(patientId)) {
      throw new SecurityException("Acesso negado. Você não tem permissão para apagar este documento.");
    }

    documentRepository.delete(document);
  }
}