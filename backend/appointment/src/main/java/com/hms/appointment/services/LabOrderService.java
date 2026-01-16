package com.hms.appointment.services;

import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.entities.LabOrder;

import java.util.List;

public interface LabOrderService {
  LabOrder createLabOrder(LabOrderCreateRequest request);

  List<LabOrder> getLabOrdersByAppointment(Long appointmentId);
}