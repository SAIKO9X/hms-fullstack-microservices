package com.hms.profile.dto.event;

import java.io.Serializable;

public record DoctorEvent(
  Long doctorId,
  Long userId,
  String fullName,
  String specialization,
  String eventType
) implements Serializable {
}