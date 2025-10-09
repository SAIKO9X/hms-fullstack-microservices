package com.hms.user.dto.response;

import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;

public record UserResponse(
  Long id,
  String name,
  String email,
  UserRole role
) {
  public static UserResponse fromEntity(User user) {
    return new UserResponse(
      user.getId(),
      user.getName(),
      user.getEmail(),
      user.getRole()
    );
  }
}
