package com.hms.appointment.dto.request;

import java.io.Serializable;

public record DoctorEvent(
  Long doctorId,
  Long userId,
  String fullName,
  String specialization,
  String eventType // "CREATED", "UPDATED"
) implements Serializable {
}