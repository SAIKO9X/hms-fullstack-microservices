package com.hms.appointment.repositories;

import com.hms.appointment.entities.HealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {
  // Encontra o último registo de métrica para um paciente
  Optional<HealthMetric> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);

  // Encontra todos os registos de um paciente
  List<HealthMetric> findByPatientIdOrderByRecordedAtDesc(Long patientId);
}