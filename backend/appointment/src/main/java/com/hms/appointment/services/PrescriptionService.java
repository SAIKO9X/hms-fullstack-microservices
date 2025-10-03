package com.hms.appointment.services;

import com.hms.appointment.request.PrescriptionCreateRequest;
import com.hms.appointment.request.PrescriptionUpdateRequest;
import com.hms.appointment.response.PrescriptionResponse;

public interface PrescriptionService {
  PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId);

  PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId);

  PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long doctorId);
<<<<<<< HEAD


=======
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
}