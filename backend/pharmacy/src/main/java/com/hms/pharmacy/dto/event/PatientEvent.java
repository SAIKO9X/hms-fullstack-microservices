package com.hms.pharmacy.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PatientEvent(
  @JsonProperty("id") Long patientId, // Mapeia "id" do JSON para patientId
  Long userId,
  @JsonProperty("name") String fullName, // Mapeia "name" do JSON para fullName
  String phoneNumber,
  String cpf,
  String eventType // "CREATED", "UPDATED"
) implements Serializable {
}