package com.hms.appointment.response;

import com.hms.appointment.entities.AdverseEffectReport;
import com.hms.appointment.enums.ReportStatus;

import java.time.LocalDateTime;

public record AdverseEffectReportResponse(
  Long id,
  Long patientId,
  Long doctorId,
  Long prescriptionId,
  String description,
  ReportStatus status,
  LocalDateTime reportedAt
) {
  public static AdverseEffectReportResponse fromEntity(AdverseEffectReport report) {
    return new AdverseEffectReportResponse(
      report.getId(),
      report.getPatientId(),
      report.getDoctorId(),
      report.getPrescriptionId(),
      report.getDescription(),
      report.getStatus(),
      report.getReportedAt()
    );
  }
}