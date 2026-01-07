package com.hms.appointment.repositories;

import com.hms.appointment.entities.PatientReadModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientReadModelRepository extends JpaRepository<PatientReadModel, Long> {
}