package com.hms.profile.services.impl;

import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.response.AppointmentResponse;
import com.hms.profile.dto.response.DoctorRatingDto;
import com.hms.profile.dto.response.ReviewResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.entities.Patient;
import com.hms.profile.entities.Review;
import com.hms.profile.enums.AppointmentStatus;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.repositories.PatientRepository;
import com.hms.profile.repositories.ReviewRepository;
import com.hms.profile.services.JwtService;
import com.hms.profile.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

  private final ReviewRepository reviewRepository;
  private final DoctorRepository doctorRepository;
  private final PatientRepository patientRepository;
  private final AppointmentFeignClient appointmentClient;
  private final JwtService jwtService;

  @Override
  @Transactional
  public ReviewResponse createReview(ReviewCreateRequest request) {
    if (reviewRepository.existsByAppointmentId(request.appointmentId())) {
      throw new IllegalStateException("Esta consulta já foi avaliada.");
    }

    AppointmentResponse appointment;
    try {
      appointment = appointmentClient.getAppointmentById(request.appointmentId());
    } catch (Exception e) {
      throw new NoSuchElementException("Consulta não encontrada ou serviço indisponível.");
    }

    if (appointment.status() != AppointmentStatus.COMPLETED) {
      throw new IllegalStateException("Apenas consultas concluídas podem ser avaliadas.");
    }

    if (!appointment.doctorId().equals(request.doctorId())) {
      throw new IllegalArgumentException("O médico informado não corresponde ao médico da consulta.");
    }

    Doctor doctor = doctorRepository.findByUserId(request.doctorId())
      .orElseThrow(() -> new NoSuchElementException("Perfil de médico não encontrado."));

    Long currentUserUserId = jwtService.getCurrentUserId();
    Patient patient = patientRepository.findByUserId(currentUserUserId)
      .orElseThrow(() -> new NoSuchElementException("Perfil de paciente não encontrado."));

    Review review = new Review();
    review.setAppointmentId(request.appointmentId());
    review.setDoctorId(doctor.getId());
    review.setPatientId(patient.getId());
    review.setRating(request.rating());
    review.setComment(request.comment());

    Review savedReview = reviewRepository.save(review);

    return mapToResponse(savedReview);
  }

  @Override
  public DoctorRatingDto getDoctorStats(Long doctorId) {
    Double avg = reviewRepository.getAverageRating(doctorId);
    Long count = reviewRepository.countByDoctorId(doctorId);
    return new DoctorRatingDto(avg != null ? avg : 0.0, count);
  }

  @Override
  public List<ReviewResponse> getDoctorReviews(Long doctorId) {
    return reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
      .stream()
      .map(this::mapToResponse)
      .toList();
  }

  private ReviewResponse mapToResponse(Review r) {
    return new ReviewResponse(
      r.getId(),
      r.getAppointmentId(),
      r.getRating(),
      r.getComment(),
      r.getCreatedAt()
    );
  }
}