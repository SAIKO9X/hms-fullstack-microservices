package com.hms.user.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
  @NotBlank(message = "O Refresh Token é obrigatório")
  String refreshToken
) {
}