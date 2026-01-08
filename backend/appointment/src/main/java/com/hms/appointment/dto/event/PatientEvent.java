package com.hms.appointment.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public record PatientEvent(
  @JsonProperty("id") Long patientId, // Mapeia "id" para "patientId"
  Long userId,
  @JsonProperty("name") String fullName, // Mapeia "name" para "fullName"
  String phoneNumber,
  String eventType // "CREATED" || "UPDATED"
) implements Serializable {
}