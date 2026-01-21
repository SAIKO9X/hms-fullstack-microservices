package com.hms.appointment.dto.response;

import com.hms.appointment.entities.AppointmentRecord;

import java.time.LocalDateTime;
import java.util.List;

public record AppointmentRecordResponse(
  Long id,
  Long appointmentId,
  String chiefComplaint,
  String historyOfPresentIllness,
  String physicalExamNotes,
  List<String> symptoms,
  String diagnosisCid10,
  String diagnosisDescription,
  String treatmentPlan,
  List<String> requestedTests,
  String notes,
  LocalDateTime createdAt
) {
  public static AppointmentRecordResponse fromEntity(AppointmentRecord record) {
    return new AppointmentRecordResponse(
      record.getId(),
      record.getAppointment().getId(),
      record.getChiefComplaint(),
      record.getHistoryOfPresentIllness(),
      record.getPhysicalExamNotes(),
      record.getSymptoms(),
      record.getDiagnosisCid10(),
      record.getDiagnosisDescription(),
      record.getTreatmentPlan(),
      record.getRequestedTests(),
      record.getNotes(),
      record.getCreatedAt()
    );
  }
}