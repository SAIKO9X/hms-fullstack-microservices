package com.hms.profile.dto.request;

import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record PatientUpdateRequest(
  String name,
  Gender gender,
  @Past LocalDate dateOfBirth,
  @Size(min = 10, max = 15) String phoneNumber,
  BloodGroup bloodGroup,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  List<String> allergies, // recebe lista para converter em SET
  String chronicConditions,
  String familyHistory
) {
}