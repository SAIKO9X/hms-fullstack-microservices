package com.hms.profile.controllers;

import com.hms.common.dto.response.ApiResponse;
import com.hms.common.security.SecurityUtils;
import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.response.DoctorRatingDto;
import com.hms.profile.dto.response.ReviewResponse;
import com.hms.profile.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profile/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  @PostMapping
  public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@RequestBody @Valid ReviewCreateRequest request, Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(reviewService.createReview(request, userId), "Avaliação enviada com sucesso."));
  }

  @GetMapping("/doctor/{doctorId}/stats")
  public ResponseEntity<ApiResponse<DoctorRatingDto>> getDoctorStats(@PathVariable Long doctorId) {
    return ResponseEntity.ok(ApiResponse.success(reviewService.getDoctorStats(doctorId)));
  }

  @GetMapping("/doctor/{doctorId}")
  public ResponseEntity<ApiResponse<List<ReviewResponse>>> getDoctorReviews(@PathVariable Long doctorId) {
    return ResponseEntity.ok(ApiResponse.success(reviewService.getDoctorReviews(doctorId)));
  }
}