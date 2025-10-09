package com.hms.appointment.dto.response;

import com.hms.appointment.entities.Prescription;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record PrescriptionForPharmacyResponse(
        Long originalPrescriptionId,
        Long patientId,
        Long doctorId,
        LocalDateTime createdAt,
        List<MedicineResponse> items
) {
    public static PrescriptionForPharmacyResponse fromEntity(Prescription prescription) {
        return new PrescriptionForPharmacyResponse(
                prescription.getId(),
                prescription.getAppointment().getPatientId(),
                prescription.getAppointment().getDoctorId(),
                prescription.getCreatedAt(),
                prescription.getMedicines().stream()
                        .map(MedicineResponse::fromEntity)
                        .collect(Collectors.toList())
        );
    }
}