package com.hms.pharmacy.dto.event;

import java.io.Serializable;
import java.time.LocalDateTime;

public record PrescriptionDispensedEvent(
  Long prescriptionId,
  Long pharmacySaleId,
  LocalDateTime dispensedAt
) implements Serializable {
}