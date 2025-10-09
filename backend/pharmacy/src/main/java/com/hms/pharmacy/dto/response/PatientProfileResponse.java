package com.hms.pharmacy.dto.response;

// Este DTO representa a resposta esperada do profile-service
public record PatientProfileResponse(
  Long userId,
  String name,
  String phoneNumber
) {}