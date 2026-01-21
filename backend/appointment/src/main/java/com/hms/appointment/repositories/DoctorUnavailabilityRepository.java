package com.hms.appointment.repositories;

import com.hms.appointment.entities.DoctorUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DoctorUnavailabilityRepository extends JpaRepository<DoctorUnavailability, Long> {

  List<DoctorUnavailability> findByDoctorId(Long doctorId);

  // Query para verificar se existe algum bloqueio que conflite com o horário solicitado
  @Query("SELECT COUNT(u) > 0 FROM DoctorUnavailability u " +
    "WHERE u.doctorId = :doctorId " +
    "AND u.startDateTime < :end " +
    "AND u.endDateTime > :start")
  boolean hasUnavailability(
    @Param("doctorId") Long doctorId,
    @Param("start") LocalDateTime start,
    @Param("end") LocalDateTime end
  );
}