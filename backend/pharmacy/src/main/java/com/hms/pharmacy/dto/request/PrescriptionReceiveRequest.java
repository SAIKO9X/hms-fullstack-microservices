package com.hms.pharmacy.dto.request;

import java.time.LocalDateTime;
import java.util.List;

public record PrescriptionReceiveRequest(
  Long originalPrescriptionId,
  Long patientId,
  Long doctorId,
  LocalDateTime createdAt,
  List<PrescriptionItemReceiveRequest> items
) {}