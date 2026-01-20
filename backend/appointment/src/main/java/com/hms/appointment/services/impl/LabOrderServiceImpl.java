package com.hms.appointment.services.impl;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.LabOrderCompletedEvent;
import com.hms.appointment.dto.request.AddLabResultRequest;
import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.dto.response.LabOrderDTO;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.LabOrder;
import com.hms.appointment.entities.LabTestItem;
import com.hms.appointment.enums.LabItemStatus;
import com.hms.appointment.enums.LabOrderStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.ResourceNotFoundException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.LabOrderRepository;
import com.hms.appointment.services.LabOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabOrderServiceImpl implements LabOrderService {

  private final LabOrderRepository labOrderRepository;
  private final AppointmentRepository appointmentRepository;
  private final RabbitTemplate rabbitTemplate;
  // private final ProfileFeignClient profileClient; // Injete isso para buscar nomes/emails

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Override
  @Transactional
  public LabOrder createLabOrder(LabOrderCreateRequest request) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new AppointmentNotFoundException("Consulta não encontrada."));

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
      .orElseThrow(() -> new ResourceNotFoundException("Lab Order not found"));

    LabTestItem item = order.getLabTestItems().stream()
      .filter(i -> i.getId().equals(itemId))
      .findFirst()
      .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

    item.setResultNotes(request.resultNotes());
    item.setAttachmentId(request.attachmentId());
    item.setStatus(LabItemStatus.COMPLETED);

    boolean allCompleted = order.getLabTestItems().stream()
      .allMatch(i -> i.getStatus() == LabItemStatus.COMPLETED);

    if (allCompleted) {
      order.setStatus(LabOrderStatus.COMPLETED);

      // --- BUSCAR DADOS DO PERFIL ---
      // var doctorProfile = profileClient.getDoctor(order.getAppointment().getDoctorId());
      // var patientProfile = profileClient.getPatient(order.getPatientId());

      // sem o Feign Client pronto agora enviar NULL
      // e deixar o Notification Service buscar, mas o ideal é preencher aqui.

      String doctorName = "Dr. Exemplo"; // doctorProfile.getFullName();
      String doctorEmail = "medico@email.com"; // doctorProfile.getEmail();
      String patientName = "Paciente Teste"; // patientProfile.getFullName();

      LabOrderCompletedEvent event = new LabOrderCompletedEvent(
        order.getId(),
        order.getOrderNumber(),
        order.getAppointment().getId(),
        order.getPatientId(),
        patientName,
        order.getAppointment().getDoctorId(),
        doctorName,
        doctorEmail,
        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
      );

      rabbitTemplate.convertAndSend(
        exchange,
        RabbitMQConfig.LAB_RESULT_ROUTING_KEY,
        event
      );
    }

    labOrderRepository.save(order);
    return mapToDTO(order);
  }

  @Override
  @Transactional(readOnly = true)
  public List<LabOrder> getLabOrdersByAppointment(Long appointmentId) {
    return labOrderRepository.findByAppointmentId(appointmentId);
  }

  // Método auxiliar Mapper
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