package com.hms.billing.repositories;

import com.hms.billing.entities.PatientInsurance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientInsuranceRepository extends JpaRepository<PatientInsurance, Long> {
  Optional<PatientInsurance> findByPatientId(String patientId);
}