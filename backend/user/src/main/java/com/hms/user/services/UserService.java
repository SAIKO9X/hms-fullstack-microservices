package com.hms.user.services;

import com.hms.user.request.LoginRequest;
import com.hms.user.request.UserRequest;
import com.hms.user.response.AuthResponse;
import com.hms.user.response.UserResponse;

public interface UserService {

  UserResponse createUser(UserRequest request);

  UserResponse getUserById(Long id);

  UserResponse getUserByEmail(String email);

  UserResponse updateUser(Long id, UserRequest request);

  AuthResponse login(LoginRequest request);
}
