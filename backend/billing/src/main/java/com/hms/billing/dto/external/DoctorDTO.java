package com.hms.billing.dto.external;

import java.math.BigDecimal;

public record DoctorDTO(
  String id,
  String name,
  String crmNumber,
  String specialization,
  BigDecimal consultationFee
) {}