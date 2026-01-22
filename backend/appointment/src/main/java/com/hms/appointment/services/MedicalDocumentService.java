package com.hms.appointment.services;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MedicalDocumentService {

  MedicalDocumentResponse createDocument(Long uploaderId, String token, MedicalDocumentCreateRequest request);

  Page<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId, Pageable pageable);

  Page<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId, Pageable pageable, Long requesterId, String requesterRole);

  void deleteDocument(Long documentId, Long patientId);
}