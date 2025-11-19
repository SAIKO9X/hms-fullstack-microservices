package com.hms.pharmacy.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueDto(
  LocalDate date,
  BigDecimal totalAmount
) {
}