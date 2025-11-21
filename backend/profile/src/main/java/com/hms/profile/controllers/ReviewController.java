package com.hms.profile.controllers;

import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.response.DoctorRatingDto;
import com.hms.profile.dto.response.ReviewResponse;
import com.hms.profile.services.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profile/reviews")
@RequiredArgsConstructor
public class ReviewController {

  private final ReviewService reviewService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ReviewResponse createReview(@RequestBody @Valid ReviewCreateRequest request) {
    return reviewService.createReview(request);
  }

  @GetMapping("/doctor/{doctorId}/stats")
  public DoctorRatingDto getDoctorStats(@PathVariable Long doctorId) {
    return reviewService.getDoctorStats(doctorId);
  }

  @GetMapping("/doctor/{doctorId}")
  public List<ReviewResponse> getDoctorReviews(@PathVariable Long doctorId) {
    return reviewService.getDoctorReviews(doctorId);
  }
}