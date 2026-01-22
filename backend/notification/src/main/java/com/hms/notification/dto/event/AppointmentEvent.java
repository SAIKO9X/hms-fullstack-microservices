package com.hms.notification.dto.event;

import java.time.LocalDateTime;

public record AppointmentEvent(
  Long appointmentId,
  Long patientId,
  String patientEmail,
  String doctorName,
  LocalDateTime appointmentDateTime,
  String meetingUrl
) {
}