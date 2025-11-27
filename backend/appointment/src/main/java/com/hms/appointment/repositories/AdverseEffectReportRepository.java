package com.hms.appointment.repositories;

import com.hms.appointment.entities.AdverseEffectReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdverseEffectReportRepository extends JpaRepository<AdverseEffectReport, Long> {
  Page<AdverseEffectReport> findByDoctorIdOrderByReportedAtDesc(Long doctorId, Pageable pageable);
}