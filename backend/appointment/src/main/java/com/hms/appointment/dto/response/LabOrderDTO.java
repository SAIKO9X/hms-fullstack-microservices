package com.hms.appointment.dto.response;

import com.hms.appointment.entities.LabTestItem;
import com.hms.appointment.enums.LabOrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record LabOrderDTO(
  Long id,
  String orderNumber,
  LocalDateTime orderDate,
  LabOrderStatus status,
  String notes,
  Long doctorId,
  Long patientId,
  List<LabTestItem> tests
) {
}