package com.hms.appointment.services.impl;

import com.hms.appointment.entities.MedicalDocument;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.repositories.MedicalDocumentRepository;
import com.hms.appointment.request.MedicalDocumentCreateRequest;
import com.hms.appointment.response.MedicalDocumentResponse;
import com.hms.appointment.services.MedicalDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalDocumentServiceImpl implements MedicalDocumentService {

  private final MedicalDocumentRepository documentRepository;

  @Override
  public MedicalDocumentResponse createDocument(Long patientId, MedicalDocumentCreateRequest request) {
    MedicalDocument document = new MedicalDocument();
    document.setPatientId(patientId);
    document.setAppointmentId(request.appointmentId());
    document.setDocumentName(request.documentName());
    document.setDocumentType(request.documentType());
    document.setMediaUrl(request.mediaUrl());

    MedicalDocument savedDocument = documentRepository.save(document);
    return MedicalDocumentResponse.fromEntity(savedDocument);
  }

  @Override
  public List<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId) {
    return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId).stream()
      .map(MedicalDocumentResponse::fromEntity)
      .collect(Collectors.toList());
  }

  @Override
  public void deleteDocument(Long documentId, Long patientId) {
    MedicalDocument document = documentRepository.findById(documentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Documento com ID " + documentId + " não encontrado."));

    // Só o próprio paciente pode apagar o seu documento
    if (!document.getPatientId().equals(patientId)) {
      throw new SecurityException("Acesso negado. Você não tem permissão para apagar este documento.");
    }

    documentRepository.delete(document);
    // Lembrar depois: Isto apaga apenas o registo no appointment-service. O ficheiro no media-service continuaria a existir.
    // Implementar depois uma comunicação com media-service para apagar o ficheiro também.
  }
}