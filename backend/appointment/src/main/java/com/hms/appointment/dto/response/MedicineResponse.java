package com.hms.appointment.dto.response;

import com.hms.appointment.entities.Medicine;

public record MedicineResponse(
  String name,
  String dosage,
  String frequency,
  Integer duration
) {
  public static MedicineResponse fromEntity(Medicine medicine) {
    return new MedicineResponse(
      medicine.getName(),
      medicine.getDosage(),
      medicine.getFrequency(),
      medicine.getDuration()
    );
  }
}