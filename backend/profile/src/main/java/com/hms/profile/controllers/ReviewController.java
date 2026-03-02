package com.hms.profile.controllers;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.common.security.SecurityUtils;
import com.hms.profile.docs.ReviewControllerDocs;
import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.request.ReviewUpdateRequest;
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
public class ReviewController implements ReviewControllerDocs {

  private final ReviewService reviewService;

  @PostMapping
  public ResponseEntity<ResponseWrapper<ReviewResponse>> createReview(@RequestBody @Valid ReviewCreateRequest request, Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(reviewService.createReview(request, userId), "Avaliação enviada com sucesso."));
  }

  @GetMapping("/doctor/{doctorId}/stats")
  public ResponseEntity<ResponseWrapper<DoctorRatingDto>> getDoctorStats(@PathVariable Long doctorId) {
    return ResponseEntity.ok(ResponseWrapper.success(reviewService.getDoctorStats(doctorId)));
  }

  @GetMapping("/doctor/{doctorId}")
  public ResponseEntity<ResponseWrapper<List<ReviewResponse>>> getDoctorReviews(@PathVariable Long doctorId) {
    return ResponseEntity.ok(ResponseWrapper.success(reviewService.getDoctorReviews(doctorId)));
  }

  @PutMapping("/doctor/{doctorId}")
  public ResponseEntity<ResponseWrapper<ReviewResponse>> updateReview(
    @PathVariable Long doctorId,
    @RequestBody @Valid ReviewUpdateRequest request,
    Authentication authentication
  ) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(reviewService.updateReview(doctorId, request, userId), "Avaliação atualizada com sucesso."));
  }

  @GetMapping("/me/doctor/{doctorId}")
  public ResponseEntity<ResponseWrapper<ReviewResponse>> getMyReviewForDoctor(@PathVariable Long doctorId, Authentication authentication) {
    Long userId = SecurityUtils.getUserId(authentication);
    return ResponseEntity.ok(ResponseWrapper.success(reviewService.getMyReviewForDoctor(doctorId, userId)));
  }
}