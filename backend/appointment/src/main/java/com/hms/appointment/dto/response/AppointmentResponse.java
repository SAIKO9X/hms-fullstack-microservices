package com.hms.appointment.dto.response;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import java.time.LocalDateTime;

public record AppointmentResponse(
  Long id,
  Long patientId,
  Long doctorId,
  LocalDateTime appointmentDateTime,
  String reason,
  AppointmentStatus status,
  String notes
) {
  public static AppointmentResponse fromEntity(Appointment appointment) {
    return new AppointmentResponse(
      appointment.getId(),
      appointment.getPatientId(),
      appointment.getDoctorId(),
      appointment.getAppointmentDateTime(),
      appointment.getReason(),
      appointment.getStatus(),
      appointment.getNotes()
    );
  }
}