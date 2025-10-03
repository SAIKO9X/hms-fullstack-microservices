package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

  Optional<Medicine> findByNameIgnoreCaseAndDosageIgnoreCase(String name, String dosage);

  @Query("SELECT m.totalStock FROM Medicine m WHERE m.id = :id")
  Optional<Integer> findStockById(@Param("id") Long id);
}
