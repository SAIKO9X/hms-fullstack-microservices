package com.hms.appointment.dto.request;

import java.io.Serializable;

public record PatientEvent(
  Long patientId,
  Long userId,
  String fullName,
  String phoneNumber,
  String eventType // "CREATED", "UPDATED"
) implements Serializable {
}