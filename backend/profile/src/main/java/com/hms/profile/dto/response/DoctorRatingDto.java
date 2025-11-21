package com.hms.profile.dto.response;

public record DoctorRatingDto(
  Double averageRating,
  Long totalReviews
) {
}