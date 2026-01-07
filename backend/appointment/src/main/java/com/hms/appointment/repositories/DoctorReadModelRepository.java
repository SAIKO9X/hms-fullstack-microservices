package com.hms.appointment.repositories;

import com.hms.appointment.entities.DoctorReadModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorReadModelRepository extends JpaRepository<DoctorReadModel, Long> {
}