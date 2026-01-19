package com.hms.appointment.repositories;

import java.time.LocalDateTime;

public interface DoctorSummaryProjection {
  Long getDoctorId();

  Long getUserId();

  String getDoctorName();

  String getSpecialization();

  String getProfilePicture();

  LocalDateTime getLastAppointmentDate();
}