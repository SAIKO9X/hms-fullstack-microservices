package com.hms.appointment.repositories;

import com.hms.appointment.entities.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabOrderRepository extends JpaRepository<LabOrder, Long> {
  List<LabOrder> findByAppointmentId(Long appointmentId);
}