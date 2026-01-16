package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.LabOrder;
import com.hms.appointment.entities.LabTestItem;
import com.hms.appointment.enums.ReportStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.LabOrderRepository;
import com.hms.appointment.services.LabOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabOrderServiceImpl implements LabOrderService {

  private final LabOrderRepository labOrderRepository;
  private final AppointmentRepository appointmentRepository;

  @Override
  @Transactional
  public LabOrder createLabOrder(LabOrderCreateRequest request) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new AppointmentNotFoundException("Consulta não encontrada para vincular exames."));

    // mapeia de dto para Entidade
    List<LabTestItem> testItems = request.tests().stream()
      .map(t -> new LabTestItem(
        t.testName(),
        t.category(),
        t.clinicalIndication(),
        t.instructions()
      ))
      .collect(Collectors.toList());

    LabOrder labOrder = LabOrder.builder()
      .appointmentId(request.appointmentId())
      .patientId(request.patientId())
      .doctorId(appointment.getDoctorId())
      .orderDate(LocalDateTime.now())
      .notes(request.notes())
      .status(ReportStatus.REPORTED)
      .tests(testItems)
      .build();

    return labOrderRepository.save(labOrder);
  }

  @Override
  @Transactional(readOnly = true)
  public List<LabOrder> getLabOrdersByAppointment(Long appointmentId) {
    return labOrderRepository.findByAppointmentId(appointmentId);
  }
}