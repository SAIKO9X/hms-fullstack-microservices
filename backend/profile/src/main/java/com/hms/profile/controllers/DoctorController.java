package com.hms.profile.controllers;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.common.security.SecurityUtils;
import com.hms.profile.docs.DoctorControllerDocs;
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
public class DoctorController implements DoctorControllerDocs {

  private final DoctorService doctorService;

  @PostMapping
  public ResponseEntity<ResponseWrapper<DoctorResponse>> createDoctorProfile(@Valid @RequestBody DoctorCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(doctorService.createDoctorProfile(request), "Perfil médico criado com sucesso."));
  }

  @GetMapping
  public ResponseEntity<ResponseWrapper<DoctorResponse>> getMyProfile(Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.getDoctorProfileByUserId(userId)));
  }

  @PatchMapping
  public ResponseEntity<ResponseWrapper<DoctorResponse>> updateMyProfile(Authentication authentication, @Valid @RequestBody DoctorUpdateRequest request) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.updateDoctorProfile(userId, request), "Perfil atualizado."));
  }

  @GetMapping("/exists/{userId}")
  public ResponseEntity<ResponseWrapper<Boolean>> doctorProfileExists(@PathVariable Long userId) {
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.doctorProfileExists(userId)));
  }

  @GetMapping("/by-user/{userId}")
  public ResponseEntity<ResponseWrapper<DoctorResponse>> getProfileByUserId(@PathVariable Long userId) {
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.getDoctorProfileByUserId(userId)));
  }

  @GetMapping("/dropdown")
  public ResponseEntity<ResponseWrapper<List<DoctorDropdownResponse>>> getDoctorsForDropdown() {
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.getDoctorsForDropdown()));
  }

  @GetMapping("/all")
  public ResponseEntity<ResponseWrapper<PagedResponse<DoctorResponse>>> getAllDoctorProfiles(@PageableDefault(size = 10, sort = "name") Pageable pageable) {
    Page<DoctorResponse> page = doctorService.findAllDoctors(pageable);
    return ResponseEntity.ok(ResponseWrapper.success(PagedResponse.of(page)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ResponseWrapper<DoctorResponse>> getDoctorProfileById(@PathVariable Long id) {
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.getDoctorProfileById(id)));
  }

  @PutMapping("/picture")
  public ResponseEntity<ResponseWrapper<Void>> updateDoctorProfilePicture(Authentication authentication, @Valid @RequestBody ProfilePictureUpdateRequest request) {
    Long userId = SecurityUtils.getUserId(authentication);
    doctorService.updateProfilePicture(userId, request.pictureUrl());
    return ResponseEntity.ok(ResponseWrapper.success(null, "Foto de perfil atualizada."));
  }

  @PutMapping("/admin/update/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<Void>> adminUpdateDoctor(@PathVariable("userId") Long userId, @RequestBody AdminDoctorUpdateRequest updateRequest) {
    doctorService.adminUpdateDoctor(userId, updateRequest);
    return ResponseEntity.ok(ResponseWrapper.success(null, "Perfil médico atualizado pelo administrador."));
  }

  @GetMapping("/exists/crm/{crm}")
  public ResponseEntity<ResponseWrapper<Boolean>> checkCrmExists(@PathVariable String crm) {
    return ResponseEntity.ok(ResponseWrapper.success(doctorService.checkCrmExists(crm)));
  }
}