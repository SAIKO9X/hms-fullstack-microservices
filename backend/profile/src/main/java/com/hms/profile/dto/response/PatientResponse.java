package com.hms.profile.dto.response;

import com.hms.profile.entities.Patient;
import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

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
  Set<String> allergies,
  String chronicConditions,
  String familyHistory,
  String profilePictureUrl
) implements Serializable {

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
      patient.getAllergies() != null ? new HashSet<>(patient.getAllergies()) : new HashSet<>(),
      patient.getChronicConditions(),
      patient.getFamilyHistory(),
      patient.getProfilePictureUrl()
    );
  }
}