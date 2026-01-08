package com.hms.appointment.repositories;

import com.hms.appointment.entities.PatientReadModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientReadModelRepository extends JpaRepository<PatientReadModel, Long> {
  Optional<PatientReadModel> findByUserId(Long userId);
}