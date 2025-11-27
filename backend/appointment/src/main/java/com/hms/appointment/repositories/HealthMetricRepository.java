package com.hms.appointment.repositories;

import com.hms.appointment.entities.HealthMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {
  Optional<HealthMetric> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);

  Page<HealthMetric> findByPatientIdOrderByRecordedAtDesc(Long patientId, Pageable pageable);
}