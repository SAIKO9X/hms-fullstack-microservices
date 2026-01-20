package com.hms.appointment.dto.request;

public record AddLabResultRequest(
  String resultNotes,
  String attachmentId
) {
}
