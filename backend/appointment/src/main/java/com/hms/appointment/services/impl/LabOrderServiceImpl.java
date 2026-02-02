package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.clients.UserFeignClient;
import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.LabOrderCompletedEvent;
import com.hms.appointment.dto.external.DoctorProfile;
import com.hms.appointment.dto.external.PatientProfile;
import com.hms.appointment.dto.external.UserResponse;
import com.hms.appointment.dto.request.AddLabResultRequest;
import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.dto.response.LabOrderDTO;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.LabOrder;
import com.hms.appointment.entities.LabTestItem;
import com.hms.appointment.enums.LabItemStatus;
import com.hms.appointment.enums.LabOrderStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.LabOrderRepository;
import com.hms.appointment.services.LabOrderService;
import com.hms.common.dto.event.EventEnvelope;
import com.hms.common.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LabOrderServiceImpl implements LabOrderService {

  private final LabOrderRepository labOrderRepository;
  private final AppointmentRepository appointmentRepository;
  private final RabbitTemplate rabbitTemplate;
  private final ProfileFeignClient profileClient;
  private final UserFeignClient userClient;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.frontend.url}")
  private String frontendUrl;

  @Override
  @Transactional
  public LabOrder createLabOrder(LabOrderCreateRequest request) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new ResourceNotFoundException("Appointment", request.appointmentId()));

    List<LabTestItem> testItems = request.tests().stream()
      .map(t -> new LabTestItem(
        t.testName(),
        t.category(),
        t.clinicalIndication(),
        t.instructions()
      ))
      .collect(Collectors.toList());

    LabOrder labOrder = LabOrder.builder()
      .appointment(appointment)
      .patientId(request.patientId())
      .orderDate(LocalDateTime.now())
      .orderNumber(UUID.randomUUID().toString().substring(0, 8).toUpperCase())
      .notes(request.notes())
      .status(LabOrderStatus.PENDING)
      .labTestItems(testItems)
      .build();

    return labOrderRepository.save(labOrder);
  }

  @Override
  @Transactional
  public LabOrderDTO addResultToItem(Long orderId, Long itemId, AddLabResultRequest request) {
    LabOrder order = labOrderRepository.findById(orderId)
      .orElseThrow(() -> new ResourceNotFoundException("Lab Order", orderId));

    LabTestItem item = order.getLabTestItems().stream()
      .filter(i -> i.getId().equals(itemId))
      .findFirst()
      .orElseThrow(() -> new ResourceNotFoundException("Lab Test Item", itemId));

    item.setResultNotes(request.resultNotes());
    item.setAttachmentId(request.attachmentId());
    item.setStatus(LabItemStatus.COMPLETED);

    boolean allCompleted = order.getLabTestItems().stream()
      .allMatch(i -> i.getStatus() == LabItemStatus.COMPLETED);

    if (allCompleted) {
      order.setStatus(LabOrderStatus.COMPLETED);
    }

    labOrderRepository.save(order);

    if (allCompleted) {
      sendLabOrderCompletedEvent(order);
    }

    return mapToDTO(order);
  }

  private void sendLabOrderCompletedEvent(LabOrder order) {
    String doctorEmail = "no-reply@hms.com";
    String doctorName = "Doutor(a)";
    String patientName = "Paciente";
    Long doctorUserId = null;

    try {
      DoctorProfile doctorProfile = profileClient.getDoctor(order.getAppointment().getDoctorId());

      if (doctorProfile != null) {
        doctorName = doctorProfile.name();
        doctorUserId = doctorProfile.userId();

        if (doctorUserId != null) {
          UserResponse userResponse = userClient.getUserById(doctorUserId);
          if (userResponse != null) {
            doctorEmail = userResponse.email();
          }
        }
      }

      PatientProfile patientProfile = profileClient.getPatient(order.getPatientId());
      if (patientProfile != null) {
        patientName = patientProfile.name();
      }

    } catch (Exception e) {
      log.error("Erro ao enriquecer evento de exame (continuando fluxo): {}", e.getMessage());
    }

    String notificationLink = frontendUrl + "/doctor/appointments/" + order.getAppointment().getId();

    LabOrderCompletedEvent event = new LabOrderCompletedEvent(
      order.getId(),
      order.getOrderNumber(),
      order.getAppointment().getId(),
      order.getPatientId(),
      patientName,
      order.getAppointment().getDoctorId(),
      doctorUserId,
      doctorName,
      doctorEmail,
      LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
      notificationLink
    );

    EventEnvelope<LabOrderCompletedEvent> envelope = EventEnvelope.create(
      "LAB_ORDER_COMPLETED",
      order.getOrderNumber(), // correlation ID
      event
    );

    rabbitTemplate.convertAndSend(exchange, RabbitMQConfig.LAB_RESULT_ROUTING_KEY, envelope);
    log.info("Evento LAB_ORDER_COMPLETED enviado: {}", order.getOrderNumber());
  }

  @Override
  @Transactional(readOnly = true)
  public List<LabOrder> getLabOrdersByAppointment(Long appointmentId) {
    return labOrderRepository.findByAppointmentId(appointmentId);
  }

  private LabOrderDTO mapToDTO(LabOrder order) {
    return new LabOrderDTO(
      order.getId(),
      order.getOrderNumber(),
      order.getOrderDate(),
      order.getStatus(),
      order.getNotes(),
      order.getAppointment().getDoctorId(),
      order.getPatientId(),
      order.getLabTestItems()
    );
  }
}