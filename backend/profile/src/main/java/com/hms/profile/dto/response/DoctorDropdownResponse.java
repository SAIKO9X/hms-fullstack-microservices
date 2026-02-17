package com.hms.profile.dto.response;

import java.math.BigDecimal;

public record DoctorDropdownResponse(Long id, Long userId, String name, BigDecimal consultationFee) {
}