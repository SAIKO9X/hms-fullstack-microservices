package com.hms.appointment.dto.request;

import java.util.List;

public record AppointmentRecordUpdateRequest(
  String chiefComplaint,
  String historyOfPresentIllness,
  String physicalExamNotes,
  List<String> symptoms,
  String diagnosisCid10,
  String diagnosisDescription,
  String treatmentPlan,
  List<String> requestedTests,
  String notes
) {
}