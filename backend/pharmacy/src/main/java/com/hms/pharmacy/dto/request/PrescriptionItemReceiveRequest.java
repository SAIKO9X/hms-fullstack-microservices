package com.hms.pharmacy.dto.request;

public record PrescriptionItemReceiveRequest(
  String medicineName,
  String dosage,
  String frequency,
  Integer duration,
  Integer quantity
) {}