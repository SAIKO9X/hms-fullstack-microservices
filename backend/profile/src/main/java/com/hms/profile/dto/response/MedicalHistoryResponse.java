package com.hms.profile.dto.response;

import java.util.List;

public record MedicalHistoryResponse(
  List<AppointmentHistoryDto> appointments
) {
}