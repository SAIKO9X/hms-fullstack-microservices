package com.hms.appointment.repositories;

import com.hms.appointment.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
  Optional<Prescription> findByAppointmentId(Long appointmentId);
}