package com.hms.profile.services;

import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.response.DoctorRatingDto;
import com.hms.profile.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

  ReviewResponse createReview(ReviewCreateRequest request);

  DoctorRatingDto getDoctorStats(Long doctorId);

  List<ReviewResponse> getDoctorReviews(Long doctorId);
}