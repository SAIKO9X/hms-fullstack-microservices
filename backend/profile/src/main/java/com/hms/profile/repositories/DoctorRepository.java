package com.hms.profile.repositories;

import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.entities.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
  Optional<Doctor> findByUserId(Long userId);

  boolean existsByUserIdOrCrmNumber(Long userId, String crmNumber);

  boolean existsByUserId(Long userId);

  @Query("SELECT new com.hms.profile.dto.response.DoctorDropdownResponse(d.userId, d.name) FROM Doctor d WHERE d.consultationFee IS NOT NULL AND d.specialization IS NOT NULL")
  List<DoctorDropdownResponse> findAllForDropdown();

  @Query("SELECT d FROM Doctor d WHERE d.consultationFee IS NOT NULL AND d.specialization IS NOT NULL AND d.specialization != '' AND d.biography IS NOT NULL AND d.biography != ''")
  List<Doctor> findAllCompleteProfiles();

  List<Doctor> findAllByUserIdIn(List<Long> userIds);

  long count();
}