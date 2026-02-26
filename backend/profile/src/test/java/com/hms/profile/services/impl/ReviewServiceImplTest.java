package com.hms.profile.services.impl;

import com.hms.common.dto.response.ApiResponse;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.profile.clients.AppointmentFeignClient;
import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.response.AppointmentResponse;
import com.hms.profile.entities.Doctor;
import com.hms.profile.entities.Patient;
import com.hms.profile.entities.Review;
import com.hms.profile.enums.AppointmentStatus;
import com.hms.profile.repositories.DoctorRepository;
import com.hms.profile.repositories.PatientRepository;
import com.hms.profile.repositories.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

  @Mock
  private ReviewRepository reviewRepository;

  @Mock
  private DoctorRepository doctorRepository;

  @Mock
  private PatientRepository patientRepository;

  @Mock
  private AppointmentFeignClient appointmentClient;

  @Mock
  private RabbitTemplate rabbitTemplate;

  @InjectMocks
  private ReviewServiceImpl reviewService;

  private Patient mockPatient;
  private Doctor mockDoctor;

  @BeforeEach
  void setUp() {
    mockPatient = new Patient();
    mockPatient.setId(10L);
    mockPatient.setUserId(100L);
    mockPatient.setName("João Paciente");

    mockDoctor = new Doctor();
    mockDoctor.setId(20L);
    mockDoctor.setUserId(200L);
  }

  @Test
  @DisplayName("Deve bloquear a criação de avaliação se a consulta estiver PENDENTE ou CANCELADA")
  void createReview_ShouldThrowException_WhenAppointmentIsNotCompleted() {
    Long currentUserId = 100L;
    Long appointmentId = 1L;
    Long doctorId = 20L;

    ReviewCreateRequest request = mock(ReviewCreateRequest.class);
    when(request.appointmentId()).thenReturn(appointmentId);

    // mock do retorno do FeignClient simulando consulta pendente
    AppointmentResponse pendingAppointment = mock(AppointmentResponse.class);
    when(pendingAppointment.status()).thenReturn(AppointmentStatus.SCHEDULED);

    when(appointmentClient.getAppointmentById(appointmentId))
      .thenReturn(ApiResponse.success(pendingAppointment));

    InvalidOperationException exception = assertThrows(InvalidOperationException.class, () -> {
      reviewService.createReview(request, currentUserId);
    });

    assertEquals("Apenas consultas concluídas podem ser avaliadas.", exception.getMessage());
    verify(reviewRepository, never()).save(any());
  }

  @Test
  @DisplayName("Deve validar a consulta via Feign, salvar avaliação e disparar notificação RabbitMQ")
  void createReview_ShouldSaveAndNotify_WhenDataIsValid() {
    Long currentUserId = 100L;
    Long appointmentId = 1L;
    Long doctorId = 20L;

    ReviewCreateRequest request = mock(ReviewCreateRequest.class);
    when(request.appointmentId()).thenReturn(appointmentId);
    when(request.doctorId()).thenReturn(doctorId);
    when(request.rating()).thenReturn(5);
    when(request.comment()).thenReturn("Excelente profissional.");

    AppointmentResponse completedAppointment = mock(AppointmentResponse.class);
    when(completedAppointment.status()).thenReturn(AppointmentStatus.COMPLETED);
    when(completedAppointment.doctorId()).thenReturn(doctorId);
    when(completedAppointment.patientId()).thenReturn(mockPatient.getId());

    when(appointmentClient.getAppointmentById(appointmentId)).thenReturn(ApiResponse.success(completedAppointment));
    when(patientRepository.findByUserId(currentUserId)).thenReturn(Optional.of(mockPatient));
    when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(mockDoctor));

    // garante que ainda não existe avaliação para esta consulta/médico
    when(reviewRepository.findByPatientIdAndDoctorId(mockPatient.getId(), mockDoctor.getId()))
      .thenReturn(Optional.empty());

    when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArguments()[0]);
    when(patientRepository.findById(mockPatient.getId())).thenReturn(Optional.of(mockPatient));

    reviewService.createReview(request, currentUserId);

    verify(reviewRepository).save(any(Review.class));
    verify(rabbitTemplate).convertAndSend(any(), eq("notification.review.alert"), any(Object.class));
  }
}