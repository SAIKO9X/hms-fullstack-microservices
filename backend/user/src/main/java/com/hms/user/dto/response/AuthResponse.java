package com.hms.user.response;

public record AuthResponse(
  String token,
  String tokenType,
  UserResponse user,
  Long expiresIn
) {
  public static AuthResponse create(String token, UserResponse user, Long expiresIn) {
    return new AuthResponse(token, "Bearer", user, expiresIn);
  }
}