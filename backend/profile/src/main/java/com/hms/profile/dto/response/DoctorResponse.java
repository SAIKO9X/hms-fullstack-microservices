package com.hms.profile.response;

import com.hms.profile.entities.Doctor;

import java.time.LocalDate;

public record DoctorResponse(
  Long id,
  Long userId,
  String name,
  LocalDate dateOfBirth,
  String crmNumber,
  String specialization,
  String department,
  String phoneNumber,
  int yearsOfExperience,
  String qualifications,
  String biography,
  String profilePictureUrl
) {
  public static DoctorResponse fromEntity(Doctor doctor) {
    return new DoctorResponse(
      doctor.getId(),
      doctor.getUserId(),
      doctor.getName(),
      doctor.getDateOfBirth(),
      doctor.getCrmNumber(),
      doctor.getSpecialization(),
      doctor.getDepartment(),
      doctor.getPhoneNumber(),
      doctor.getYearsOfExperience(),
      doctor.getQualifications(),
      doctor.getBiography(),
      doctor.getProfilePictureUrl()
    );
  }
}