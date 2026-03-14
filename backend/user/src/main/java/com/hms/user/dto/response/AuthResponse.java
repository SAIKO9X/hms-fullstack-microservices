package com.hms.user.dto.response;

public record AuthResponse(
  String tokenType,
  UserResponse user,
  Long expiresIn,
  String accessToken,
  String refreshToken
) {
  public static AuthResponse create(UserResponse user, Long expiresIn, String accessToken, String refreshToken) {
    return new AuthResponse(
      "Bearer",
      user,
      expiresIn,
      accessToken,
      refreshToken
    );
  }
}