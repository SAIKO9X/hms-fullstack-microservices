package com.hms.appointment.repositories;

import com.hms.appointment.entities.MedicalDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
  Page<MedicalDocument> findByPatientIdOrderByUploadedAtDesc(Long patientId, Pageable pageable);
}