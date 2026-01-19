package com.hms.billing.repositories;

import com.hms.billing.entities.InsuranceProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InsuranceProviderRepository extends JpaRepository<InsuranceProvider, Long> {
  Optional<InsuranceProvider> findByName(String name);
}