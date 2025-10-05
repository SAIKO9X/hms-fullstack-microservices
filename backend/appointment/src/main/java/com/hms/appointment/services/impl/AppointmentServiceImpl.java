package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.exceptions.ProfileNotFoundException;
import com.hms.appointment.exceptions.SchedulingConflictException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.request.AppointmentCreateRequest;
import com.hms.appointment.response.*;
import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

  private final AppointmentRepository appointmentRepository;
  private final ProfileFeignClient profileFeignClient;

  @Override
  @Transactional
  public AppointmentResponse createAppointment(Long patientId, AppointmentCreateRequest request) {
    if (!profileFeignClient.patientProfileExists(patientId)) {
      throw new ProfileNotFoundException("Perfil do paciente com ID " + patientId + " não existe.");
    }
    if (!profileFeignClient.doctorProfileExists(request.doctorId())) {
      throw new ProfileNotFoundException("Perfil do doutor com ID " + request.doctorId() + " não existe.");
    }

    if (appointmentRepository.existsByDoctorIdAndAppointmentDateTime(request.doctorId(), request.appointmentDateTime())) {
      throw new SchedulingConflictException("O doutor já possui uma consulta agendada para este horário.");
    }

    Appointment appointment = new Appointment();
    appointment.setPatientId(patientId);
    appointment.setDoctorId(request.doctorId());
    appointment.setAppointmentDateTime(request.appointmentDateTime());
    appointment.setReason(request.reason());
    appointment.setStatus(AppointmentStatus.SCHEDULED);

    return AppointmentResponse.fromEntity(appointmentRepository.save(appointment));
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentResponse getAppointmentById(Long appointmentId, Long requesterId) {
    Appointment appointment = findAppointmentByIdOrThrow(appointmentId);
    // Validação de segurança: o requisitante é o paciente ou o doutor da consulta?
    if (!appointment.getPatientId().equals(requesterId) && !appointment.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado. Você não faz parte desta consulta.");
    }
    return AppointmentResponse.fromEntity(appointment);
  }

  @Override
  @Transactional(readOnly = true)
  public List<AppointmentResponse> getAppointmentsForPatient(Long patientId) {
    return appointmentRepository.findByPatientId(patientId).stream()
      .map(AppointmentResponse::fromEntity)
      .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<AppointmentResponse> getAppointmentsForDoctor(Long doctorId) {
    return appointmentRepository.findByDoctorId(doctorId).stream()
      .map(AppointmentResponse::fromEntity)
      .collect(Collectors.toList());
  }


  @Override
  @Transactional(readOnly = true)
  public List<AppointmentDetailResponse> getAppointmentDetailsForDoctor(Long doctorId) {
    List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
    DoctorProfileResponse doctor = profileFeignClient.getDoctorProfile(doctorId);

    List<AppointmentDetailResponse> appointmentDetails = new ArrayList<>();
    for (Appointment appointment : appointments) {
      PatientProfileResponse patient = profileFeignClient.getPatientProfile(appointment.getPatientId());
      appointmentDetails.add(new AppointmentDetailResponse(
        appointment.getId(),
        appointment.getPatientId(),
        patient.name(),
        patient.phoneNumber(),
        appointment.getDoctorId(),
        doctor.name(),
        appointment.getAppointmentDateTime(),
        appointment.getReason(),
        appointment.getStatus()
      ));
    }
    return appointmentDetails;
  }

  @Override
  @Transactional
  public AppointmentResponse rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long requesterId) {
    Appointment appointment = findAppointmentByIdOrThrow(appointmentId);
    if (!appointment.getPatientId().equals(requesterId) && !appointment.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado.");
    }
    if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
      throw new InvalidUpdateException("Apenas consultas agendadas podem ser remarcadas.");
    }
    if (appointmentRepository.existsByDoctorIdAndAppointmentDateTime(appointment.getDoctorId(), newDateTime)) {
      throw new SchedulingConflictException("O doutor já possui uma consulta agendada para este novo horário.");
    }

    appointment.setAppointmentDateTime(newDateTime);
    return AppointmentResponse.fromEntity(appointmentRepository.save(appointment));
  }

  @Override
  @Transactional
  public AppointmentResponse cancelAppointment(Long appointmentId, Long requesterId) {
    Appointment appointment = findAppointmentByIdOrThrow(appointmentId);
    if (!appointment.getPatientId().equals(requesterId) && !appointment.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado.");
    }
    if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
      throw new InvalidUpdateException("Apenas consultas agendadas podem ser canceladas.");
    }

    appointment.setStatus(AppointmentStatus.CANCELED);
    return AppointmentResponse.fromEntity(appointmentRepository.save(appointment));
  }

  @Override
  @Transactional
  public AppointmentResponse completeAppointment(Long appointmentId, String notes, Long doctorId) {
    Appointment appointment = findAppointmentByIdOrThrow(appointmentId);
    // Validação de segurança e negócio: só o doutor da consulta pode completá-la
    if (!appointment.getDoctorId().equals(doctorId)) {
      throw new SecurityException("Apenas o doutor responsável pode completar a consulta.");
    }
    if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
      throw new InvalidUpdateException("Apenas consultas agendadas podem ser completadas.");
    }

    appointment.setStatus(AppointmentStatus.COMPLETED);
    appointment.setNotes(notes);
    return AppointmentResponse.fromEntity(appointmentRepository.save(appointment));
  }

  @Transactional(readOnly = true)
  public AppointmentDetailResponse getAppointmentDetailsById(Long appointmentId, Long requesterId) {
    // Busca o agendamento local
    Appointment appointment = findAppointmentByIdOrThrow(appointmentId);
    // (Validação de segurança)
    if (!appointment.getPatientId().equals(requesterId) && !appointment.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado.");
    }

    // Busca os dados externos (agregação)
    PatientProfileResponse patient = profileFeignClient.getPatientProfile(appointment.getPatientId());
    DoctorProfileResponse doctor = profileFeignClient.getDoctorProfile(appointment.getDoctorId());

    // Monta a resposta final
    return new AppointmentDetailResponse(
      appointment.getId(),
      appointment.getPatientId(),
      patient.name(),
      patient.phoneNumber(),
      appointment.getDoctorId(),
      doctor.name(),
      appointment.getAppointmentDateTime(),
      appointment.getReason(),
      appointment.getStatus()
    );
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentResponse getNextAppointmentForPatient(Long patientId) {
    return appointmentRepository
      .findFirstByPatientIdAndStatusAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
        patientId, AppointmentStatus.SCHEDULED, LocalDateTime.now())
      .map(AppointmentResponse::fromEntity)
      .orElse(null); // Retorna nulo se não houver próximas consultas
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentStatsResponse getAppointmentStatsForPatient(Long patientId) {
    List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
    long total = appointments.size();
    long scheduled = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED).count();
    long completed = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
    long canceled = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELED).count();
    return new AppointmentStatsResponse(total, scheduled, completed, canceled);
  }

  private Appointment findAppointmentByIdOrThrow(Long appointmentId) {
    return appointmentRepository.findById(appointmentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Agendamento com ID " + appointmentId + " não encontrado."));
  }
}