package com.hms.appointment.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public record DoctorEvent(
  @JsonProperty("id") Long doctorId, // Mapeia "id" (do JSON) para "doctorId"
  Long userId,
  @JsonProperty("name") String fullName, // Mapeia "name" (do JSON) para "fullName"
  String specialization,
  String eventType // "CREATED" || "UPDATED"
) implements Serializable {
}