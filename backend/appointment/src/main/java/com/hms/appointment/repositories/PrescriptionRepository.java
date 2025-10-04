package com.hms.appointment.repositories;

import com.hms.appointment.entities.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
  Optional<Prescription> findByAppointmentId(Long appointmentId);

  @Query("SELECT p FROM Prescription p WHERE p.appointment.patientId = :patientId")
  List<Prescription> findByAppointmentPatientId(Long patientId);
}