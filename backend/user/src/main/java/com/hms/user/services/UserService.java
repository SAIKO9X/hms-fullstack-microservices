package com.hms.user.services;

import com.hms.user.dto.request.AdminCreateUserRequest;
import com.hms.user.dto.request.AdminUpdateUserRequest;
import com.hms.user.dto.request.LoginRequest;
import com.hms.user.dto.request.UserRequest;
import com.hms.user.dto.response.AuthResponse;
import com.hms.user.dto.response.UserResponse;

public interface UserService {

  UserResponse createUser(UserRequest request);

  UserResponse getUserById(Long id);

  UserResponse getUserByEmail(String email);

  UserResponse updateUser(Long id, UserRequest request);

  AuthResponse login(LoginRequest request);

  void updateUserStatus(Long id, boolean active);

  UserResponse adminCreateUser(AdminCreateUserRequest request);

  void adminUpdateUser(Long userId, AdminUpdateUserRequest request);
}
