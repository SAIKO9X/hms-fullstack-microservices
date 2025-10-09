package com.hms.appointment.dto.response;

import com.hms.appointment.entities.AppointmentRecord;

import java.time.LocalDateTime;
import java.util.List;

public record AppointmentRecordResponse(
  Long id,
  Long appointmentId,
  List<String> symptoms,
  String diagnosis,
  List<String> tests,
  String notes,
  List<String> prescription,
  LocalDateTime createdAt
) {
  public static AppointmentRecordResponse fromEntity(AppointmentRecord record) {
    return new AppointmentRecordResponse(
      record.getId(),
      record.getAppointment().getId(),
      record.getSymptoms(),
      record.getDiagnosis(),
      record.getTests(),
      record.getNotes(),
      record.getPrescription(),
      record.getCreatedAt()
    );
  }
}