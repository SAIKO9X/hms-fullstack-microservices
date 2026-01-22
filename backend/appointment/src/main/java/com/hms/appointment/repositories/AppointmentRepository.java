package com.hms.appointment.repositories;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

  Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

  Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

  List<Appointment> findByPatientId(Long patientId);

  List<Appointment> findByDoctorId(Long doctorId);

  List<Appointment> findByStatusAndAppointmentDateTimeBefore(AppointmentStatus status, LocalDateTime dateTime);

  Optional<Appointment> findFirstByPatientIdAndStatusAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
    Long patientId, AppointmentStatus status, LocalDateTime now);

  @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND FUNCTION('DATE', a.appointmentDateTime) = CURRENT_DATE")
  long countAppointmentsForToday(@Param("doctorId") Long doctorId);

  @Query("SELECT COUNT(a) FROM Appointment a WHERE FUNCTION('DATE', a.appointmentDateTime) = CURRENT_DATE")
  long countAllAppointmentsForToday();

  @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND a.status = 'COMPLETED' AND a.appointmentDateTime >= :weekAgo")
  long countCompletedAppointmentsSince(@Param("doctorId") Long doctorId, @Param("weekAgo") LocalDateTime weekAgo);

  @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId GROUP BY a.status")
  List<Object[]> countAppointmentsByStatus(@Param("doctorId") Long doctorId);

  @Query("SELECT COUNT(DISTINCT a.patientId) FROM Appointment a WHERE a.doctorId = :doctorId")
  long countDistinctPatientsByDoctorId(@Param("doctorId") Long doctorId);

  @Query("SELECT DISTINCT ar.appointment.patientId FROM AppointmentRecord ar WHERE ar.appointment.doctorId = :doctorId AND (LOWER(ar.diagnosisDescription) LIKE %:keyword% OR LOWER(ar.diagnosisCid10) LIKE %:keyword%)")
  List<Long> findDistinctPatientIdsByDoctorAndDiagnosisKeyword(@Param("doctorId") Long doctorId, @Param("keyword") String keyword);

  @Query("SELECT FUNCTION('DATE', a.appointmentDateTime), COUNT(a) FROM Appointment a WHERE a.appointmentDateTime >= :startDate GROUP BY FUNCTION('DATE', a.appointmentDateTime)")
  List<Object[]> countAppointmentsFromDateGroupedByDay(@Param("startDate") LocalDateTime startDate);

  @Query("SELECT p.patientId, MIN(FUNCTION('DATE', p.appointmentDateTime)) FROM Appointment p WHERE p.appointmentDateTime >= :startDate GROUP BY p.patientId")
  List<Object[]> findFirstAppointmentDateForPatients(@Param("startDate") LocalDateTime startDate);

  List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);

  List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(Long doctorId, LocalDateTime startOfDay, LocalDateTime endOfDay);

  List<Appointment> findByPatientIdAndAppointmentDateTimeBefore(Long patientId, LocalDateTime dateTime);

  @Query("SELECT a.patientId as patientId, p.userId as userId, p.fullName as patientName, p.email as patientEmail, p.profilePicture as profilePicture, COUNT(a) as totalAppointments, MAX(a.appointmentDateTime) as lastAppointmentDate FROM Appointment a JOIN PatientReadModel p ON a.patientId = p.patientId WHERE a.doctorId = :doctorId GROUP BY a.patientId, p.userId, p.fullName, p.email, p.profilePicture")
  List<DoctorPatientSummaryProjection> findPatientsSummaryByDoctor(@Param("doctorId") Long doctorId);

  @Query("SELECT a.doctorId as doctorId, d.userId as userId, d.fullName as doctorName, d.specialization as specialization, d.profilePicture as profilePicture, MAX(a.appointmentDateTime) as lastAppointmentDate FROM Appointment a JOIN DoctorReadModel d ON a.doctorId = d.doctorId WHERE a.patientId = :patientId GROUP BY a.doctorId, d.userId, d.fullName, d.specialization, d.profilePicture")
  List<DoctorSummaryProjection> findDoctorsSummaryByPatient(@Param("patientId") Long patientId);

  @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patientId = :patientId AND CAST(a.appointmentDateTime AS date) = :date AND a.status <> 'CANCELED'")
  long countByPatientIdAndDate(@Param("patientId") Long patientId, @Param("date") LocalDate date);


  @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
    "WHERE a.doctorId = :doctorId " +
    "AND a.status <> 'CANCELED' " +
    "AND (a.appointmentDateTime < :newEnd AND a.appointmentEndTime > :newStart)")
  boolean hasDoctorConflict(
    @Param("doctorId") Long doctorId,
    @Param("newStart") LocalDateTime newStart,
    @Param("newEnd") LocalDateTime newEnd);

  @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
    "WHERE a.patientId = :patientId " +
    "AND a.status <> 'CANCELED' " +
    "AND (a.appointmentDateTime < :newEnd AND a.appointmentEndTime > :newStart)")
  boolean hasPatientConflict(
    @Param("patientId") Long patientId,
    @Param("newStart") LocalDateTime newStart,
    @Param("newEnd") LocalDateTime newEnd);

  @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
    "WHERE a.doctorId = :doctorId " +
    "AND a.id <> :appointmentId " +
    "AND a.status <> 'CANCELED' " +
    "AND (a.appointmentDateTime < :newEnd AND a.appointmentEndTime > :newStart)")
  boolean hasDoctorConflictExcludingId(
    @Param("doctorId") Long doctorId,
    @Param("newStart") LocalDateTime newStart,
    @Param("newEnd") LocalDateTime newEnd,
    @Param("appointmentId") Long appointmentId);

  @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctorId = :doctorId AND a.patientId = :patientId AND a.status <> 'CANCELED'")
  boolean existsByDoctorIdAndPatientId(@Param("doctorId") Long doctorId, @Param("patientId") Long patientId);
}