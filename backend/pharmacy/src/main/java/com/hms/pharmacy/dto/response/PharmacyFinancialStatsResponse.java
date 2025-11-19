package com.hms.pharmacy.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record PharmacyFinancialStatsResponse(
  BigDecimal totalRevenueLast30Days,
  List<DailyRevenueDto> dailyBreakdown
) {
}