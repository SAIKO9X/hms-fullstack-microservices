package com.hms.profile.controllers;

import com.hms.common.security.SecurityUtils;
import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.request.ProfilePictureUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.services.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/doctors")
public class DoctorController {

  private final DoctorService doctorService;

  @PostMapping
  public ResponseEntity<DoctorResponse> createDoctorProfile(@Valid @RequestBody DoctorCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.createDoctorProfile(request));
  }

  @GetMapping
  public ResponseEntity<DoctorResponse> getMyProfile(Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(doctorService.getDoctorProfileByUserId(userId));
  }

  @PatchMapping
  public ResponseEntity<DoctorResponse> updateMyProfile(
    Authentication authentication,
    @Valid @RequestBody DoctorUpdateRequest request
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(doctorService.updateDoctorProfile(userId, request));
  }

  @GetMapping("/exists/{userId}")
  public ResponseEntity<Boolean> doctorProfileExists(@PathVariable Long userId) {
    return ResponseEntity.ok(doctorService.doctorProfileExists(userId));
  }

  @GetMapping("/by-user/{userId}")
  public ResponseEntity<DoctorResponse> getProfileByUserId(@PathVariable Long userId) {
    return ResponseEntity.ok(doctorService.getDoctorProfileByUserId(userId));
  }

  @GetMapping("/dropdown")
  public ResponseEntity<List<DoctorDropdownResponse>> getDoctorsForDropdown() {
    return ResponseEntity.ok(doctorService.getDoctorsForDropdown());
  }

  @GetMapping("/all")
  public ResponseEntity<Page<DoctorResponse>> getAllDoctorProfiles(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
    return ResponseEntity.ok(doctorService.findAllDoctors(pageable));
  }

  @GetMapping("/{id}")
  public ResponseEntity<DoctorResponse> getDoctorProfileById(@PathVariable Long id) {
    return ResponseEntity.ok(doctorService.getDoctorProfileById(id));
  }

  @PutMapping("/picture")
  public ResponseEntity<Void> updateDoctorProfilePicture(
    Authentication authentication,
    @Valid @RequestBody ProfilePictureUpdateRequest request
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    doctorService.updateProfilePicture(userId, request.pictureUrl());
    return ResponseEntity.ok().build();
  }

  @PutMapping("/admin/update/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> adminUpdateDoctor(
    @PathVariable("userId") Long userId,
    @RequestBody AdminDoctorUpdateRequest updateRequest
  ) {
    doctorService.adminUpdateDoctor(userId, updateRequest);
    return ResponseEntity.ok().build();
  }
}