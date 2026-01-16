package com.hms.appointment.dto.request;

public record LabTestItemRequest(
  String testName,
  String category,
  String clinicalIndication,
  String instructions
) {
}