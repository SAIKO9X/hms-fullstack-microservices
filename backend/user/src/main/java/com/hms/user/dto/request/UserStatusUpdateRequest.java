package com.hms.user.dto.request;

import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateRequest(
  @NotNull Boolean active
) {
}