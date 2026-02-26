package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.clients.UserFeignClient;
import com.hms.appointment.dto.request.AddLabResultRequest;
import com.hms.appointment.dto.response.LabOrderDTO;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.LabOrder;
import com.hms.appointment.entities.LabTestItem;
import com.hms.appointment.enums.LabItemStatus;
import com.hms.appointment.enums.LabOrderStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.LabOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LabOrderServiceImplTest {

  @Mock
  private LabOrderRepository labOrderRepository;

  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private RabbitTemplate rabbitTemplate;

  @Mock
  private ProfileFeignClient profileClient;

  @Mock
  private UserFeignClient userClient;

  @InjectMocks
  private LabOrderServiceImpl labOrderService;

  private LabOrder mockLabOrder;
  private LabTestItem item1;
  private LabTestItem item2;

  @BeforeEach
  void setUp() throws Exception {
    item1 = new LabTestItem("Hemograma", "Sangue", "Rotina", null);
    item2 = new LabTestItem("Glicemia", "Sangue", "Rotina", null);

    // reflection para injeção de ID, mantendo a entidade protegida sem setters públicos
    var idField = LabTestItem.class.getDeclaredField("id");
    idField.setAccessible(true);
    idField.set(item1, 101L);
    idField.set(item2, 102L);

    Appointment mockAppointment = new Appointment();
    var appointmentIdField = Appointment.class.getDeclaredField("id");
    appointmentIdField.setAccessible(true);
    appointmentIdField.set(mockAppointment, 10L);
    mockAppointment.setDoctorId(1L);

    mockLabOrder = LabOrder.builder()
      .patientId(1L)
      .orderNumber("ORD123")
      .status(LabOrderStatus.PENDING)
      .labTestItems(List.of(item1, item2))
      .appointment(mockAppointment)
      .build();
  }

  @Test
  @DisplayName("Deve adicionar resultado a um item e NÃO completar a ordem se houver exames pendentes")
  void addResultToItem_ShouldNotCompleteOrder_WhenSomeItemsStillPending() {
    when(labOrderRepository.findById(1L)).thenReturn(Optional.of(mockLabOrder));
    AddLabResultRequest request = new AddLabResultRequest("Tudo normal", null);

    LabOrderDTO result = labOrderService.addResultToItem(1L, 101L, request);

    assertEquals(LabItemStatus.COMPLETED, item1.getStatus());
    assertEquals(LabItemStatus.PENDING, item2.getStatus());
    assertEquals(LabOrderStatus.PENDING, mockLabOrder.getStatus(), "A ordem de serviço principal deve permanecer pendente");

    verify(labOrderRepository).save(mockLabOrder);
    verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
  }

  @Test
  @DisplayName("Deve completar a ordem inteira e disparar evento ao finalizar o último item pendente")
  void addResultToItem_ShouldCompleteOrder_WhenAllItemsCompleted() {
    // prepara estado parcial onde apenas um item falta ser concluído
    item1.setStatus(LabItemStatus.COMPLETED);
    when(labOrderRepository.findById(1L)).thenReturn(Optional.of(mockLabOrder));

    AddLabResultRequest request = new AddLabResultRequest("Glicose normal", null);

    LabOrderDTO result = labOrderService.addResultToItem(1L, 102L, request);

    assertEquals(LabItemStatus.COMPLETED, item2.getStatus());
    assertEquals(LabOrderStatus.COMPLETED, mockLabOrder.getStatus());

    verify(labOrderRepository).save(mockLabOrder);

    // valida o side-effect de notificação assíncrona gerado pela conclusão total da ordem
    verify(rabbitTemplate).convertAndSend(any(), any(), any(Object.class));
  }
}