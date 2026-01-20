package com.hms.appointment.services;

import com.hms.appointment.dto.request.AddLabResultRequest;
import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.dto.response.LabOrderDTO;
import com.hms.appointment.entities.LabOrder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface LabOrderService {
  LabOrder createLabOrder(LabOrderCreateRequest request);

  @Transactional
  LabOrderDTO addResultToItem(Long orderId, Long itemId, AddLabResultRequest request);

  List<LabOrder> getLabOrdersByAppointment(Long appointmentId);
}