package com.hms.billing.external;

import java.math.BigDecimal;

public record DoctorDTO(
  Long id,
  BigDecimal consultationFee
) {
}
