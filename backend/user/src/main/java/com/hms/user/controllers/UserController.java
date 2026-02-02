package com.hms.user.controllers;

import com.hms.user.dto.request.AdminCreateUserRequest;
import com.hms.user.dto.request.AdminUpdateUserRequest;
import com.hms.user.dto.request.UserRequest;
import com.hms.user.dto.request.UserStatusUpdateRequest;
import com.hms.user.dto.response.UserResponse;
import com.hms.user.services.UserService;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
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
import com.hms.common.security.Auditable;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
    UserResponse createdUser = userService.createUser(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdUser));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
    UserResponse user = userService.getUserById(id);
    return ResponseEntity.ok(ApiResponse.success(user));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
    UserResponse updatedUser = userService.updateUser(id, request);
    return ResponseEntity.ok(ApiResponse.success(updatedUser));
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "CHANGE_USER_STATUS", resourceName = "User")
  public ResponseEntity<ApiResponse<Void>> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
    userService.updateUserStatus(id, request.active());
    return ResponseEntity.ok(ApiResponse.success(null, "Status do usuário atualizado com sucesso."));
  }

  @PostMapping("/admin/create")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<UserResponse>> adminCreateUser(@RequestBody AdminCreateUserRequest request) {
    UserResponse user = userService.adminCreateUser(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(user));
  }

  @PutMapping("/admin/update/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "ADMIN_UPDATE_USER", resourceName = "User")
  public ResponseEntity<ApiResponse<Void>> adminUpdateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest request) {
    userService.adminUpdateUser(id, request);
    return ResponseEntity.ok(ApiResponse.success(null, "Usuário atualizado pelo admin."));
  }

  @GetMapping("/all")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(@PageableDefault(page = 0, size = 10, sort = "name") Pageable pageable) {
    Page<UserResponse> page = userService.findAllUsers(pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }
}