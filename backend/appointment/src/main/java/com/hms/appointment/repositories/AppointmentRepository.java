package com.hms.appointment.repositories;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

  List<Appointment> findByPatientId(Long patientId);

  List<Appointment> findByDoctorId(Long doctorId);

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


  List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(Long doctorId, LocalDateTime startOfDay, LocalDateTime endOfDay);
}