package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.PatientReadModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientReadModelRepository extends JpaRepository<PatientReadModel, Long> {
}