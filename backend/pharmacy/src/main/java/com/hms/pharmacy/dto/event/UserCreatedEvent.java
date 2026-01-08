package com.hms.pharmacy.dto.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserCreatedEvent(
  Long userId,
  String name,
  String email,
  String role
) implements Serializable {
}