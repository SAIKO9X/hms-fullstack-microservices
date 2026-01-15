package com.hms.appointment.repositories;

import java.time.LocalDateTime;

public interface DoctorPatientSummaryProjection {
  Long getPatientId();

  String getPatientName();

  String getPatientEmail();

  Long getTotalAppointments();

  LocalDateTime getLastAppointmentDate();
}