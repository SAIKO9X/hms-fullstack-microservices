package com.hms.profile.response;

import com.hms.profile.entities.Patient;
import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;

import java.time.LocalDate;

public record PatientResponse(
  Long id,
  Long userId,
  String cpf,
  LocalDate dateOfBirth,
  String phoneNumber,
  BloodGroup bloodGroup,
  Gender gender,
  String name,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  String allergies,
  String chronicDiseases
) {
  public static PatientResponse fromEntity(Patient patient) {
    return new PatientResponse(
      patient.getId(),
      patient.getUserId(),
      patient.getCpf(),
      patient.getDateOfBirth(),
      patient.getPhoneNumber(),
      patient.getBloodGroup(),
      patient.getGender(),
      patient.getName(),
      patient.getAddress(),
      patient.getEmergencyContactName(),
      patient.getEmergencyContactPhone(),
      patient.getAllergies(),
      patient.getChronicDiseases()
    );
  }
}