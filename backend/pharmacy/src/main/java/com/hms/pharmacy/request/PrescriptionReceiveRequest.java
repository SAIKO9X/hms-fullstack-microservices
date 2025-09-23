package com.hms.pharmacy.request;

import java.util.List;

public record PrescriptionReceiveRequest(
  Long originalAppointmentId,
  Long patientId,
  Long doctorId,
  List<PrescriptionItemReceiveRequest> items
) {}