package com.hms.appointment.dto.response;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.enums.AppointmentType;

import java.time.LocalDateTime;

public record AppointmentResponse(
  Long id,
  Long patientId,
  Long doctorId,
  LocalDateTime appointmentDateTime,
  Integer duration,
  LocalDateTime appointmentEndTime,
  String reason,
  AppointmentStatus status,
  AppointmentType type,
  String meetingUrl,
  String notes
) {
  public static AppointmentResponse fromEntity(Appointment appointment) {
    return new AppointmentResponse(
      appointment.getId(),
      appointment.getPatientId(),
      appointment.getDoctorId(),
      appointment.getAppointmentDateTime(),
      appointment.getDuration(),
      appointment.getAppointmentEndTime(),
      appointment.getReason(),
      appointment.getStatus(),
      appointment.getType(),
      appointment.getMeetingUrl(),
      appointment.getNotes()
    );
  }
}