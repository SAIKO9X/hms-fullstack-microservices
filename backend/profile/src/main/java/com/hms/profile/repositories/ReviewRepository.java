package com.hms.profile.repositories;

import com.hms.profile.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

  boolean existsByAppointmentId(Long appointmentId);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctorId = :doctorId")
  Double getAverageRating(Long doctorId);

  Long countByDoctorId(Long doctorId);
}