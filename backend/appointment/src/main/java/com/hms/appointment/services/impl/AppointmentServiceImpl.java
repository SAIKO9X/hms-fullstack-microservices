package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.exceptions.ProfileNotFoundException;
import com.hms.appointment.exceptions.SchedulingConflictException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
  public List<AppointmentDetailResponse> getAppointmentDetailsForDoctor(Long doctorId, String dateFilter) {
    List<Appointment> appointments;
    LocalDateTime start;
    LocalDateTime end;

    if ("today".equalsIgnoreCase(dateFilter)) {
      start = LocalDate.now().atStartOfDay();
      end = LocalDate.now().atTime(23, 59, 59);
      appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, start, end);
    } else if ("week".equalsIgnoreCase(dateFilter)) {
      // Lógica para a semana
      start = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
      end = LocalDate.now().with(DayOfWeek.SUNDAY).atTime(23, 59, 59);
      appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, start, end);
    } else if ("month".equalsIgnoreCase(dateFilter)) {
      // Lógica para o mês
      start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
      end = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);
      appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, start, end);
    } else {
      appointments = appointmentRepository.findByDoctorId(doctorId);
    }

    if (appointments.isEmpty()) {
      return new ArrayList<>();
    }

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

  @Override
  public DoctorDashboardStatsResponse getDoctorDashboardStats(Long doctorId) {
    // Contar consultas de hoje
    long appointmentsToday = appointmentRepository.countAppointmentsForToday(doctorId);

    // Contar concluídas na semana
    LocalDateTime startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
    long completedThisWeek = appointmentRepository.countCompletedAppointmentsSince(doctorId, startOfWeek);

    // Obter distribuição por status
    Map<AppointmentStatus, Long> statusDistribution = appointmentRepository.countAppointmentsByStatus(doctorId)
      .stream()
      .collect(Collectors.toMap(
        row -> (AppointmentStatus) row[0],
        row -> (Long) row[1]
      ));

    // Adiciona status que não têm consultas com contagem zero
    Arrays.stream(AppointmentStatus.values())
      .forEach(status -> statusDistribution.putIfAbsent(status, 0L));


    return new DoctorDashboardStatsResponse(appointmentsToday, completedThisWeek, statusDistribution);
  }

  @Override
  public long countUniquePatientsForDoctor(Long doctorId) {
    return appointmentRepository.countDistinctPatientsByDoctorId(doctorId);
  }

  @Override
  public List<PatientGroupResponse> getPatientGroupsForDoctor(Long doctorId) {
    Map<String, List<String>> conditionVariations = Map.of(
      "Diabéticos", List.of("diabetes", "diabético", "glicemia"),
      "Hipertensos", List.of("hipertensão", "pressão alta", "has"),
      "Asmáticos", List.of("asma", "bronquite"),
      "Cardíacos", List.of("cardíaco", "cardiopatia", "infarto"),
      "Colesterol", List.of("colesterol", "dislipidemia", "ldl")
    );

    return conditionVariations.entrySet().stream()
      .map(entry -> {
        String groupName = entry.getKey();
        List<String> keywords = entry.getValue();

        // Set para garantir que cada paciente seja contado apenas uma vez
        Set<Long> uniquePatientIds = new HashSet<>();
        for (String keyword : keywords) {
          uniquePatientIds.addAll(
            appointmentRepository.findDistinctPatientIdsByDoctorAndDiagnosisKeyword(doctorId, keyword)
          );
        }

        return new PatientGroupResponse(groupName, uniquePatientIds.size());
      })
      .filter(group -> group.patientCount() > 0)
      .sorted((a, b) -> Long.compare(b.patientCount(), a.patientCount()))
      .collect(Collectors.toList());
  }

  @Override
  public List<DailyActivityDto> getDailyActivityStats() {
    LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

    // Contar consultas por dia
    List<Object[]> appointmentCounts = appointmentRepository.countAppointmentsFromDateGroupedByDay(thirtyDaysAgo);
    Map<LocalDate, Long> appointmentsByDay = appointmentCounts.stream()
      .collect(Collectors.toMap(
        row -> ((java.sql.Date) row[0]).toLocalDate(),
        row -> (Long) row[1]
      ));

    // Contar novos pacientes por dia (primeira consulta nos últimos 30 dias)
    List<Object[]> firstAppointments = appointmentRepository.findFirstAppointmentDateForPatients(thirtyDaysAgo);
    Map<LocalDate, Long> newPatientsByDay = firstAppointments.stream()
      .collect(Collectors.groupingBy(
        row -> ((java.sql.Date) row[1]).toLocalDate(),
        Collectors.counting()
      ));

    // Gerar a lista de DTOs para os últimos 30 dias
    return IntStream.range(0, 30)
      .mapToObj(i -> LocalDate.now().minusDays(i))
      .map(date -> new DailyActivityDto(
        date,
        newPatientsByDay.getOrDefault(date, 0L),
        appointmentsByDay.getOrDefault(date, 0L)
      ))
      .sorted(Comparator.comparing(DailyActivityDto::date))
      .collect(Collectors.toList());
  }

  @Override
  public long countAllAppointmentsForToday() {
    return appointmentRepository.countAllAppointmentsForToday();
  }

  private Appointment findAppointmentByIdOrThrow(Long appointmentId) {
    return appointmentRepository.findById(appointmentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Agendamento com ID " + appointmentId + " não encontrado."));
  }
}