package com.hms.appointment.repositories;

import com.hms.appointment.entities.AdverseEffectReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdverseEffectReportRepository extends JpaRepository<AdverseEffectReport, Long> {
  List<AdverseEffectReport> findByDoctorIdOrderByReportedAtDesc(Long doctorId);
}