package com.hms.appointment.services;

import com.hms.appointment.request.PrescriptionCreateRequest;
import com.hms.appointment.request.PrescriptionUpdateRequest;
import com.hms.appointment.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.response.PrescriptionResponse;

import java.util.List;

public interface PrescriptionService {
  PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId);

  PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId);

  PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long doctorId);

  List<PrescriptionResponse> getPrescriptionsByPatientId(Long patientId, Long requesterId);

  PrescriptionForPharmacyResponse getPrescriptionForPharmacy(Long prescriptionId);
}