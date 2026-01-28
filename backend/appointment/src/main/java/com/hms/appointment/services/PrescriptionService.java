package com.hms.appointment.services;

import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface PrescriptionService {
  PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId);

  PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId);

  PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long doctorId);

  Page<PrescriptionResponse> getPrescriptionsByPatientId(Long patientId, Long requesterId, Pageable pageable);

  PrescriptionForPharmacyResponse getPrescriptionForPharmacy(Long prescriptionId);

  void markAsDispensed(Long prescriptionId);

  PrescriptionResponse getLatestPrescriptionByPatientId(Long patientId);

  byte[] generatePrescriptionPdf(Long prescriptionId, Long requesterId);
}