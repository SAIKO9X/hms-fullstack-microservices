package com.hms.appointment.repositories;

import com.hms.appointment.entities.MedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
  List<MedicalDocument> findByPatientIdOrderByUploadedAtDesc(Long patientId);
}