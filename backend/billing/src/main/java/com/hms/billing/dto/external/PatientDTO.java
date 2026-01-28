package com.hms.billing.dto.external;

public record PatientDTO(
  String id,
  String name,
  String cpf,
  String email
) {}