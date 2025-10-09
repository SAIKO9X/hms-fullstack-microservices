package com.hms.appointment.services;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;

import java.util.List;

public interface MedicalDocumentService {
  MedicalDocumentResponse createDocument(Long uploaderId, String token, MedicalDocumentCreateRequest request);

  List<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId);

  void deleteDocument(Long documentId, Long patientId);
}