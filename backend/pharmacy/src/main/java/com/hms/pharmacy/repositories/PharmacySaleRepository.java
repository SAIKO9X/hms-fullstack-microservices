package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.PharmacySale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PharmacySaleRepository extends JpaRepository<PharmacySale, Long> {
  List<PharmacySale> findByPatientId(Long patientId);

  boolean existsByOriginalPrescriptionId(Long originalPrescriptionId);
}