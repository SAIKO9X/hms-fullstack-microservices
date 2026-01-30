package com.hms.profile.services.impl;

import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceNotFoundException;
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
import com.hms.profile.services.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

  private final ReviewRepository reviewRepository;
  private final DoctorRepository doctorRepository;
  private final PatientRepository patientRepository;
  private final AppointmentFeignClient appointmentClient;

  @Override
  public ReviewResponse createReview(ReviewCreateRequest request, Long currentUserId) {
    validateReviewNotExists(request.appointmentId());

    AppointmentResponse appointment = fetchAppointment(request.appointmentId());
    validateAppointmentStatus(appointment);
    validateDoctorMatch(appointment, request.doctorId());

    Patient patient = findPatientByUserId(currentUserId);
    validatePatientOwnership(appointment, patient);

    Doctor doctor = findDoctorByUserId(request.doctorId());

    Review review = buildReview(request, doctor, patient);
    Review savedReview = reviewRepository.save(review);

    log.info("Avaliação registrada com sucesso: ID={}, Paciente={}, Médico={}",
      savedReview.getId(), patient.getName(), doctor.getName());

    return mapToResponse(savedReview);
  }

  @Override
  @Transactional(readOnly = true)
  public DoctorRatingDto getDoctorStats(Long doctorId) {
    Double averageRating = reviewRepository.getAverageRating(doctorId);
    Long reviewCount = reviewRepository.countByDoctorId(doctorId);

    return new DoctorRatingDto(
      averageRating != null ? averageRating : 0.0,
      reviewCount
    );
  }

  @Override
  @Transactional(readOnly = true)
  public List<ReviewResponse> getDoctorReviews(Long doctorId) {
    return reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
      .stream()
      .map(this::mapToResponse)
      .toList();
  }

  private void validateReviewNotExists(Long appointmentId) {
    if (reviewRepository.existsByAppointmentId(appointmentId)) {
      throw new InvalidOperationException("Esta consulta já foi avaliada anteriormente.");
    }
  }

  private AppointmentResponse fetchAppointment(Long appointmentId) {
    try {
      return appointmentClient.getAppointmentById(appointmentId);
    } catch (Exception e) {
      log.error("Falha ao buscar consulta ID {} no microsserviço de Appointment: {}", appointmentId, e.getMessage());
      throw new ResourceNotFoundException("Appointment", appointmentId);
    }
  }

  private void validateAppointmentStatus(AppointmentResponse appointment) {
    if (appointment.status() != AppointmentStatus.COMPLETED) {
      throw new InvalidOperationException("Apenas consultas concluídas podem ser avaliadas.");
    }
  }

  private void validateDoctorMatch(AppointmentResponse appointment, Long requestedDoctorId) {
    if (!appointment.doctorId().equals(requestedDoctorId)) {
      throw new InvalidOperationException("O médico informado não corresponde ao médico responsável pela consulta.");
    }
  }

  private Patient findPatientByUserId(Long userId) {
    return patientRepository.findByUserId(userId)
      .orElseThrow(() -> new ResourceNotFoundException("Patient Profile", userId));
  }

  private void validatePatientOwnership(AppointmentResponse appointment, Patient patient) {
    if (!appointment.patientId().equals(patient.getId())) {
      throw new AccessDeniedException("Esta consulta não pertence ao seu perfil de paciente.");
    }
  }

  private Doctor findDoctorByUserId(Long userId) {
    return doctorRepository.findByUserId(userId)
      .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile", userId));
  }

  private Review buildReview(ReviewCreateRequest request, Doctor doctor, Patient patient) {
    Review review = new Review();
    review.setAppointmentId(request.appointmentId());
    review.setDoctorId(doctor.getId());
    review.setPatientId(patient.getId());
    review.setRating(request.rating());
    review.setComment(request.comment());
    return review;
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