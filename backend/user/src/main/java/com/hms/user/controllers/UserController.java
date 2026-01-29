package com.hms.user.controllers;

import com.hms.common.security.Auditable;
import com.hms.user.dto.request.AdminCreateUserRequest;
import com.hms.user.dto.request.AdminUpdateUserRequest;
import com.hms.user.dto.request.UserRequest;
import com.hms.user.dto.request.UserStatusUpdateRequest;
import com.hms.user.dto.response.UserResponse;
import com.hms.user.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  @PostMapping("/register")
  public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
    return ResponseEntity.ok(userService.updateUser(id, request));
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "CHANGE_USER_STATUS", resourceName = "User")
  public ResponseEntity<Void> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
    userService.updateUserStatus(id, request.active());
    return ResponseEntity.ok().build();
  }

  @PostMapping("/admin/create")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserResponse> adminCreateUser(@RequestBody AdminCreateUserRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(userService.adminCreateUser(request));
  }

  @PutMapping("/admin/update/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "ADMIN_UPDATE_USER", resourceName = "User")
  public ResponseEntity<Void> adminUpdateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest request) {
    userService.adminUpdateUser(id, request);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/all")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<UserResponse>> getAllUsers(@PageableDefault(page = 0, size = 10, sort = "name") Pageable pageable) {
    return ResponseEntity.ok(userService.findAllUsers(pageable));
  }
}