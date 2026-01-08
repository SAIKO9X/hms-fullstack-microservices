package com.hms.appointment.dto.event;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

public record PrescriptionIssuedEvent(
  Long prescriptionId,
  Long patientId,
  Long doctorId,
  LocalDate validUntil,
  String notes,
  List<PrescriptionItemEvent> items
) implements Serializable {

  public record PrescriptionItemEvent(
    String medicineName,
    String dosage,
    String frequency,
    Integer durationDays
  ) implements Serializable {
  }
}