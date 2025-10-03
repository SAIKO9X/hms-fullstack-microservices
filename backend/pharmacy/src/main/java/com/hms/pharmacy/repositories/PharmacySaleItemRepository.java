package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.PharmacySaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacySaleItemRepository extends JpaRepository<PharmacySaleItem, Long> {
}