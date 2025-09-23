package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.MedicineInventory;
import com.hms.pharmacy.enums.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MedicineInventoryRepository extends JpaRepository<MedicineInventory, Long> {

  List<MedicineInventory> findByStatusAndExpiryDateBefore(StockStatus status, LocalDate date);

  List<MedicineInventory> findByMedicineIdAndStatusAndQuantityGreaterThanOrderByExpiryDateAsc(
    Long medicineId, StockStatus status, Integer quantity
  );
}
