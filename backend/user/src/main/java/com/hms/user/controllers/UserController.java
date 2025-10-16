package com.hms.user.controllers;

import com.hms.user.dto.request.AdminCreateUserRequest;
import com.hms.user.dto.request.AdminUpdateUserRequest;
import com.hms.user.dto.request.UserRequest;
import com.hms.user.dto.response.UserResponse;
import com.hms.user.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public UserResponse createUser(@Valid @RequestBody UserRequest request) {
    return userService.createUser(request);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public UserResponse getUserById(@PathVariable Long id) {
    return userService.getUserById(id);
  }

  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
    return userService.updateUser(id, request);
  }

  @PatchMapping("/{id}/status")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public void updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
    userService.updateUserStatus(id, status.get("active"));
  }

  @PostMapping("/admin/create")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')")
  public UserResponse adminCreateUser(@RequestBody AdminCreateUserRequest request) {
    return userService.adminCreateUser(request);
  }

  @PutMapping("/admin/update/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> adminUpdateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest request) {
    userService.adminUpdateUser(id, request);
    return ResponseEntity.ok().build();
  }
}
