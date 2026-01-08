package com.hms.appointment.repositories;

import com.hms.appointment.entities.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {

  // Busca o primeiro paciente da fila para aquele médico naquela data (FIFO - First In, First Out)
  Optional<WaitlistEntry> findFirstByDoctorIdAndDateOrderByCreatedAtAsc(Long doctorId, LocalDate date);

  boolean existsByPatientIdAndDoctorIdAndDate(Long patientId, Long doctorId, LocalDate date);
}