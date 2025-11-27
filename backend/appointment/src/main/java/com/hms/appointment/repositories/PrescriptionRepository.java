package com.hms.appointment.repositories;

import com.hms.appointment.entities.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

  Optional<Prescription> findByAppointmentId(Long appointmentId);

  @Query("SELECT p FROM Prescription p WHERE p.appointment.patientId = :patientId")
  Page<Prescription> findByAppointmentPatientId(@Param("patientId") Long patientId, Pageable pageable);

  Optional<Prescription> findFirstByAppointmentPatientIdOrderByCreatedAtDesc(Long patientId);
}