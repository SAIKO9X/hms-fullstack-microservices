package com.hms.appointment.repositories;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

  List<Appointment> findByPatientId(Long patientId);

  List<Appointment> findByDoctorId(Long doctorId);

  boolean existsByDoctorIdAndAppointmentDateTime(Long doctorId, LocalDateTime appointmentDateTime);

  Optional<Appointment> findFirstByPatientIdAndStatusAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
    Long patientId, AppointmentStatus status, LocalDateTime now);
}