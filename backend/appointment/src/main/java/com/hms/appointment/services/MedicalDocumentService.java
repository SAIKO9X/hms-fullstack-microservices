package com.hms.appointment.services;

import com.hms.appointment.request.MedicalDocumentCreateRequest;
import com.hms.appointment.response.MedicalDocumentResponse;

import java.util.List;

public interface MedicalDocumentService {
  MedicalDocumentResponse createDocument(Long patientId, MedicalDocumentCreateRequest request);

  List<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId);
}