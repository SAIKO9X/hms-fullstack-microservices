package com.hms.appointment.response;

public record PatientGroupResponse(
  String groupName,
  long patientCount
) {
}