package com.hms.appointment.services;

import com.hms.appointment.request.PrescriptionCreateRequest;
import com.hms.appointment.request.PrescriptionUpdateRequest;
import com.hms.appointment.response.PrescriptionResponse;

public interface PrescriptionService {
  PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId);

  PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId);

  PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long doctorId);


}