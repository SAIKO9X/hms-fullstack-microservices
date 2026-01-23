package com.hms.appointment.dto.response;

import com.hms.appointment.entities.MedicalDocument;
import com.hms.appointment.enums.DocumentType;

import java.time.LocalDateTime;

public record MedicalDocumentResponse(
  Long id,
  Long patientId,
  Long uploadedByUserId,
  Long appointmentId,
  String documentName,
  DocumentType documentType,
  String mediaUrl,
  LocalDateTime uploadedAt
) {
  public static MedicalDocumentResponse fromEntity(MedicalDocument document) {
    return new MedicalDocumentResponse(
      document.getId(),
      document.getPatientId(),
      document.getUploadedByUserId(),
      document.getAppointmentId(),
      document.getDocumentName(),
      document.getDocumentType(),
      document.getMediaUrl(),
      document.getUploadedAt()
    );
  }
}