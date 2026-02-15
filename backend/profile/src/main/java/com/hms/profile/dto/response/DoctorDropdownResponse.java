package com.hms.profile.dto.response;

import java.math.BigDecimal;

public record DoctorDropdownResponse(Long userId, String name, BigDecimal consultationFee) {
}