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

  // Verifica se já existe uma consulta para o mesmo médico no mesmo horário
  boolean existsByDoctorIdAndAppointmentDateTime(Long doctorId, LocalDateTime appointmentDateTime);

  // Consulta para encontrar a próxima consulta agendada para um paciente específico
  Optional<Appointment> findFirstByPatientIdAndStatusAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
    Long patientId, AppointmentStatus status, LocalDateTime now);

  // Consulta para contar as consultas agendadas para hoje para um médico específico
  @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND FUNCTION('DATE', a.appointmentDateTime) = CURRENT_DATE")
  long countAppointmentsForToday(@Param("doctorId") Long doctorId);

  // Conta todas as consultas para hoje (sem filtro de médico)
  @Query("SELECT COUNT(a) FROM Appointment a WHERE FUNCTION('DATE', a.appointmentDateTime) = CURRENT_DATE")
  long countAllAppointmentsForToday();

  // Consulta para contar as consultas concluídas do médico na última semana
  @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId AND a.status = 'COMPLETED' AND a.appointmentDateTime >= :weekAgo")
  long countCompletedAppointmentsSince(@Param("doctorId") Long doctorId, @Param("weekAgo") LocalDateTime weekAgo);

  // Consulta para agrupar e contar as consultas por status
  @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId GROUP BY a.status")
  List<Object[]> countAppointmentsByStatus(@Param("doctorId") Long doctorId);

  // Consulta para contar o número de pacientes distintos atendidos por um médico
  @Query("SELECT COUNT(DISTINCT a.patientId) FROM Appointment a WHERE a.doctorId = :doctorId")
  long countDistinctPatientsByDoctorId(@Param("doctorId") Long doctorId);

  // Consulta para contar o número de pacientes com base em uma palavra-chave
  @Query("SELECT DISTINCT a.patientId FROM Appointment a " +
    "JOIN AppointmentRecord ar ON a.id = ar.appointment.id " +
    "WHERE a.doctorId = :doctorId AND LOWER(ar.diagnosis) LIKE %:keyword%")
  List<Long> findDistinctPatientIdsByDoctorAndDiagnosisKeyword(@Param("doctorId") Long doctorId, @Param("keyword") String keyword);

  // Consulta para contar consultas a partir de uma data específica, agrupadas por dia
  @Query("SELECT FUNCTION('DATE', a.appointmentDateTime), COUNT(a) FROM Appointment a WHERE a.appointmentDateTime >= :startDate GROUP BY FUNCTION('DATE', a.appointmentDateTime)")
  List<Object[]> countAppointmentsFromDateGroupedByDay(@Param("startDate") LocalDateTime startDate);

  // Consulta para encontrar a data da primeira consulta de cada paciente a partir de uma data específica
  @Query("SELECT p.patientId, MIN(FUNCTION('DATE', p.appointmentDateTime)) FROM Appointment p WHERE p.appointmentDateTime >= :startDate GROUP BY p.patientId")
  List<Object[]> findFirstAppointmentDateForPatients(@Param("startDate") LocalDateTime startDate);

  List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);

  List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(Long doctorId, LocalDateTime startOfDay, LocalDateTime endOfDay);

  List<Appointment> findByPatientIdAndAppointmentDateTimeBefore(Long patientId, LocalDateTime dateTime);

  // Consulta para obter o resumo dos pacientes atendidos por um médico específico
  @Query("SELECT a.patientId as patientId, " +
    "p.fullName as patientName, " +
    "p.email as patientEmail, " +
    "COUNT(a) as totalAppointments, " +
    "MAX(a.appointmentDateTime) as lastAppointmentDate " +
    "FROM Appointment a " +
    "JOIN PatientReadModel p ON a.patientId = p.patientId " +
    "WHERE a.doctorId = :doctorId " +
    "GROUP BY a.patientId, p.fullName, p.email")
  List<DoctorPatientSummaryProjection> findPatientsSummaryByDoctor(@Param("doctorId") Long doctorId);


  // verifica se existe algum agendamento onde o intervalo (Start-End) se cruza com o novo intervalo
  @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
    "WHERE a.doctorId = :doctorId " +
    "AND a.status != 'CANCELED' " +
    "AND a.appointmentDateTime < :endTime " +
    "AND :startTime < (a.appointmentDateTime + 1 HOUR)")
  boolean existsByDoctorIdAndTimeRange(@Param("doctorId") Long doctorId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

  // conta agendamentos de um paciente num dia específico
  @Query("SELECT COUNT(a) FROM Appointment a " +
    "WHERE a.patientId = :patientId " +
    "AND CAST(a.appointmentDateTime AS date) = :date " +
    "AND a.status != 'CANCELED'")
  long countByPatientIdAndDate(@Param("patientId") Long patientId, @Param("date") LocalDate date);
}
}