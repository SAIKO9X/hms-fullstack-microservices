package com.hms.profile.controllers;

import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.request.ProfilePictureUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
import com.hms.profile.services.DoctorService;
import com.hms.profile.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile/doctors")
public class DoctorController {

  private final DoctorService doctorService;
  private final JwtService jwtService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public DoctorResponse createDoctorProfile(@Valid @RequestBody DoctorCreateRequest request) {
    return doctorService.createDoctorProfile(request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public DoctorResponse getMyProfile(@RequestHeader("Authorization") String token) {
    Long userId = getUserIdFromToken(token);
    return doctorService.getDoctorProfileByUserId(userId);
  }

  @PutMapping
  @ResponseStatus(HttpStatus.OK)
  public DoctorResponse updateMyProfile(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody DoctorUpdateRequest request) {
    Long userId = getUserIdFromToken(token);
    return doctorService.updateDoctorProfile(userId, request);
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
  @PreAuthorize("hasRole('ADMIN')")
  public List<DoctorResponse> getAllDoctorProfiles() {
    return doctorService.findAllDoctors();
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public DoctorResponse getDoctorProfileById(@PathVariable Long id) {
    return doctorService.getDoctorProfileById(id);
  }

  @PutMapping("/picture")
  @ResponseStatus(HttpStatus.OK)
  public void updatePatientProfilePicture(
    @RequestHeader("Authorization") String token,
    @Valid @RequestBody ProfilePictureUpdateRequest request) {
    Long userId = getUserIdFromToken(token);
    doctorService.updateProfilePicture(userId, request.pictureUrl());
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

  private Long getUserIdFromToken(String token) {
    String jwt = token.substring(7);
    return jwtService.extractClaim(jwt, claims -> claims.get("userId", Long.class));
  }
}