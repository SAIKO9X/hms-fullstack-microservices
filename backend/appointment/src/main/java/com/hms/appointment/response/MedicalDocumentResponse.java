package com.hms.appointment.response;

import com.hms.appointment.entities.MedicalDocument;

import java.time.LocalDateTime;

public record MedicalDocumentResponse(
  Long id,
  Long patientId,
  Long appointmentId,
  String documentName,
  String documentType,
  String mediaUrl,
  LocalDateTime uploadedAt
) {
  public static MedicalDocumentResponse fromEntity(MedicalDocument document) {
    return new MedicalDocumentResponse(
      document.getId(),
      document.getPatientId(),
      document.getAppointmentId(),
      document.getDocumentName(),
      document.getDocumentType(),
      document.getMediaUrl(),
      document.getUploadedAt()
    );
  }
}