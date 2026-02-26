package com.hms.profile.services.impl;

import com.hms.common.exceptions.ResourceAlreadyExistsException;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.repositories.DoctorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

  @Mock
  private DoctorRepository doctorRepository;

  @Mock
  private RabbitTemplate rabbitTemplate;

  @InjectMocks
  private DoctorServiceImpl doctorService;

  @Test
  @DisplayName("Deve bloquear a criação de um perfil de médico se o utilizador ou CRM já estiverem registrados")
  void createDoctorProfile_ShouldThrowException_WhenProfileAlreadyExists() {
    Long userId = 999L;
    DoctorCreateRequest request = new DoctorCreateRequest(userId, "12345-SP", "Dr. House");

    when(doctorRepository.existsByUserIdOrCrmNumber(request.userId(), request.crmNumber()))
      .thenReturn(true);

    ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class, () -> {
      doctorService.createDoctorProfile(request);
    });

    assertEquals("Doctor Profile já existe: userId/CRM", exception.getMessage());

    verify(doctorRepository, never()).save(any());
    verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
  }
}