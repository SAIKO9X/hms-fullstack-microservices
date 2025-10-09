package com.hms.appointment.dto.response;

public record PatientGroupResponse(
  String groupName,
  long patientCount
) {
}