package com.hms.pharmacy.request;

import java.time.LocalDateTime;
import java.util.List;

public record PrescriptionReceiveRequest(
  Long originalPrescriptionId,
  Long patientId,
  Long doctorId,
  LocalDateTime createdAt,
  List<PrescriptionItemReceiveRequest> items
) {}