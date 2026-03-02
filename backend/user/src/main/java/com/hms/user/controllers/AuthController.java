package com.hms.user.controllers;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.user.docs.AuthControllerDocs;
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
public class AuthController implements AuthControllerDocs {

  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<ResponseWrapper<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
    AuthResponse response = userService.login(request);
    return ResponseEntity.ok(ResponseWrapper.success(response));
  }

  @PostMapping("/verify")
  public ResponseEntity<ResponseWrapper<Void>> verifyAccount(@RequestParam String email, @RequestParam String code) {
    userService.verifyAccount(email, code);
    return ResponseEntity.ok(ResponseWrapper.success(null, "Conta verificada com sucesso."));
  }

  @PostMapping("/resend-code")
  public ResponseEntity<ResponseWrapper<Void>> resendCode(@RequestParam String email) {
    userService.resendVerificationCode(email);
    return ResponseEntity.ok(ResponseWrapper.success(null, "Código de verificação reenviado."));
  }
}