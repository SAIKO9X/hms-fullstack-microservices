package com.hms.appointment.repositories;

import com.hms.appointment.entities.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
  List<DoctorAvailability> findByDoctorId(Long doctorId);
}