package com.hms.appointment.repositories;

import com.hms.appointment.entities.DoctorReadModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorReadModelRepository extends JpaRepository<DoctorReadModel, Long> {
  Optional<DoctorReadModel> findByUserId(Long userId);
}