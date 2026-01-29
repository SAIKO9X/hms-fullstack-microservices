package com.hms.user.controllers;

import com.hms.user.dto.request.LoginRequest;
import com.hms.user.dto.response.AuthResponse;
import com.hms.user.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(userService.login(request));
  }

  @PostMapping("/verify")
  public ResponseEntity<Void> verifyAccount(@RequestParam String email, @RequestParam String code) {
    userService.verifyAccount(email, code);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/resend-code")
  public ResponseEntity<Void> resendCode(@RequestParam String email) {
    userService.resendVerificationCode(email);
    return ResponseEntity.ok().build();
  }
}