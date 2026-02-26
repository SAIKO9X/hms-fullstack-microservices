package com.hms.notification.dto.event;

import java.time.LocalDateTime;

public record AppointmentEvent(
  Long appointmentId,
  Long patientId,
  Long patientUserId,
  String patientName,
  String patientEmail,
  String doctorName,
  LocalDateTime appointmentDateTime,
  String meetingUrl
) {
}