package com.hms.profile.repositories;

import com.hms.profile.dto.response.PatientDropdownResponse;
import com.hms.profile.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

  Optional<Patient> findByUserId(Long userId);

  boolean existsByUserIdOrCpf(Long userId, String cpf);

  boolean existsByUserId(Long userId);

  @Query("SELECT new com.hms.profile.dto.response.PatientDropdownResponse(p.userId, p.name) FROM Patient p")
  List<PatientDropdownResponse> findAllForDropdown();

  long count();
}