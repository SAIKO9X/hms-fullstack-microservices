package com.hms.user.controllers;

import com.hms.user.request.LoginRequest;
import com.hms.user.response.AuthResponse;
import com.hms.user.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

  private final UserService userService;

  @PostMapping("/login")
  @ResponseStatus(HttpStatus.OK)
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return userService.login(request);
  }
}
