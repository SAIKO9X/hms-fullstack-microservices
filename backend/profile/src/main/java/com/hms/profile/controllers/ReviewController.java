package com.hms.profile.controllers;

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
  public ResponseEntity<ReviewResponse> createReview(
    @RequestBody @Valid ReviewCreateRequest request,
    Authentication authentication
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request, userId));
  }

  @GetMapping("/doctor/{doctorId}/stats")
  public ResponseEntity<DoctorRatingDto> getDoctorStats(@PathVariable Long doctorId) {
    return ResponseEntity.ok(reviewService.getDoctorStats(doctorId));
  }

  @GetMapping("/doctor/{doctorId}")
  public ResponseEntity<List<ReviewResponse>> getDoctorReviews(@PathVariable Long doctorId) {
    return ResponseEntity.ok(reviewService.getDoctorReviews(doctorId));
  }
}