package com.hms.appointment.dto.response;

import com.hms.appointment.entities.Prescription;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record PrescriptionResponse(
  Long id,
  Long appointmentId,
  Long patientId,
  String notes,
  List<MedicineResponse> medicines,
  LocalDateTime createdAt
) {
  public static PrescriptionResponse fromEntity(Prescription prescription) {
    return new PrescriptionResponse(
      prescription.getId(),
      prescription.getAppointment().getId(),
      prescription.getAppointment().getPatientId(),
      prescription.getNotes(),
      prescription.getMedicines().stream()
        .map(MedicineResponse::fromEntity)
        .collect(Collectors.toList()),
      prescription.getCreatedAt()
    );
  }
}