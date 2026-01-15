package com.hms.profile.controllers;

import com.hms.common.security.HmsUserPrincipal;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/doctors")
public class DoctorController {

  private final DoctorService doctorService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public DoctorResponse createDoctorProfile(@Valid @RequestBody DoctorCreateRequest request) {
    return doctorService.createDoctorProfile(request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public DoctorResponse getMyProfile(@AuthenticationPrincipal HmsUserPrincipal user) {
    return doctorService.getDoctorProfileByUserId(user.getId());
  }

  @PatchMapping
  @ResponseStatus(HttpStatus.OK)
  public DoctorResponse updateMyProfile(
    @AuthenticationPrincipal HmsUserPrincipal user,
    @Valid @RequestBody DoctorUpdateRequest request
  ) {
    return doctorService.updateDoctorProfile(user.getId(), request);
  }

  @GetMapping("/exists/{userId}")
  @ResponseStatus(HttpStatus.OK)
  public Boolean doctorProfileExists(@PathVariable Long userId) {
    return doctorService.doctorProfileExists(userId);
  }

  @GetMapping("/by-user/{userId}")
  @ResponseStatus(HttpStatus.OK)
  public DoctorResponse getProfileByUserId(@PathVariable Long userId) {
    return doctorService.getDoctorProfileByUserId(userId);
  }

  @GetMapping("/dropdown")
  @ResponseStatus(HttpStatus.OK)
  public List<DoctorDropdownResponse> getDoctorsForDropdown() {
    return doctorService.getDoctorsForDropdown();
  }

  @GetMapping("/all")
  @ResponseStatus(HttpStatus.OK)
  public Page<DoctorResponse> getAllDoctorProfiles(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
    return doctorService.findAllDoctors(pageable);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public DoctorResponse getDoctorProfileById(@PathVariable Long id) {
    return doctorService.getDoctorProfileById(id);
  }

  @PutMapping("/picture")
  @ResponseStatus(HttpStatus.OK)
  public void updateDoctorProfilePicture(
    @AuthenticationPrincipal HmsUserPrincipal user,
    @Valid @RequestBody ProfilePictureUpdateRequest request
  ) {
    doctorService.updateProfilePicture(user.getId(), request.pictureUrl());
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