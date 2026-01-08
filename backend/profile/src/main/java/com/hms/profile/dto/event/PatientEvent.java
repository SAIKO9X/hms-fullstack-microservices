package com.hms.profile.dto.event;

import java.io.Serializable;

public record PatientEvent(
  Long patientId,
  Long userId,
  String fullName,
  String phoneNumber,
  String eventType // "CREATED", "UPDATED"
) implements Serializable {
}