package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.PrescriptionCopy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionCopyRepository extends JpaRepository<PrescriptionCopy, Long> {
}