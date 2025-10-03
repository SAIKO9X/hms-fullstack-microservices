package com.hms.appointment.repositories;

import com.hms.appointment.entities.AppointmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppointmentRecordRepository extends JpaRepository<AppointmentRecord, Long> {
  Optional<AppointmentRecord> findByAppointmentId(Long appointmentId);
}