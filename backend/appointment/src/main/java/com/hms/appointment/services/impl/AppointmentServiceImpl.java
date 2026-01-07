package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.entities.PatientReadModel;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.exceptions.ProfileNotFoundException;
import com.hms.appointment.exceptions.SchedulingConflictException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.appointment.services.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
  private final DoctorReadModelRepository doctorReadModelRepository;
  private final PatientReadModelRepository patientReadModelRepository;

  @Override
  @Transactional
  public AppointmentResponse createAppointment(Long patientId, AppointmentCreateRequest request) {
    if (!patientReadModelRepository.existsById(patientId)) {
      throw new ProfileNotFoundException("Perfil do paciente com ID " + patientId + " não encontrado na base sincronizada.");
    }

    if (!doctorReadModelRepository.existsById(request.doctorId())) {
      throw new ProfileNotFoundException("Perfil do doutor com ID " + request.doctorId() + " não encontrado na base sincronizada.");
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

    if (!appointment.getPatientId().equals(requesterId) && !appointment.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado. Você não faz parte desta consulta.");
    }
    return AppointmentResponse.fromEntity(appointment);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AppointmentResponse> getAppointmentsForPatient(Long patientId, Pageable pageable) {
    return appointmentRepository.findByPatientId(patientId, pageable)
      .map(AppointmentResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AppointmentResponse> getAppointmentsForDoctor(Long doctorId, Pageable pageable) {
    return appointmentRepository.findByDoctorId(doctorId, pageable)
      .map(AppointmentResponse::fromEntity);
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
      start = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
      end = LocalDate.now().with(DayOfWeek.SUNDAY).atTime(23, 59, 59);
      appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, start, end);
    } else if ("month".equalsIgnoreCase(dateFilter)) {
      start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
      end = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);
      appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, start, end);
    } else {
      appointments = appointmentRepository.findByDoctorId(doctorId);
    }

    if (appointments.isEmpty()) {
      return new ArrayList<>();
    }

    DoctorReadModel doctor = doctorReadModelRepository.findById(doctorId)
      .orElse(new DoctorReadModel(doctorId, null, "Médico (Sincronizando)", "N/A"));

    List<AppointmentDetailResponse> appointmentDetails = new ArrayList<>();

    // Ajustar Depois: buscar todos os pacientes de uma vez (bulk fetch)
    for (Appointment appointment : appointments) {
      PatientReadModel patient = patientReadModelRepository.findById(appointment.getPatientId())
        .orElse(new PatientReadModel(appointment.getPatientId(), null, "Paciente Desconhecido", "N/A"));

      appointmentDetails.add(new AppointmentDetailResponse(
        appointment.getId(),
        appointment.getPatientId(),
        patient.getFullName(),
        patient.getPhoneNumber(),
        appointment.getDoctorId(),
        doctor.getFullName(),
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
    Appointment appointment = findAppointmentByIdOrThrow(appointmentId);

    if (!appointment.getPatientId().equals(requesterId) && !appointment.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado.");
    }

    PatientReadModel patient = patientReadModelRepository.findById(appointment.getPatientId())
      .orElse(new PatientReadModel(appointment.getPatientId(), null, "Paciente Desconhecido", "N/A"));

    DoctorReadModel doctor = doctorReadModelRepository.findById(appointment.getDoctorId())
      .orElse(new DoctorReadModel(appointment.getDoctorId(), null, "Médico Desconhecido", "N/A"));

    return new AppointmentDetailResponse(
      appointment.getId(),
      appointment.getPatientId(),
      patient.getFullName(),
      patient.getPhoneNumber(),
      appointment.getDoctorId(),
      doctor.getFullName(),
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
      .orElse(null);
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
    long appointmentsToday = appointmentRepository.countAppointmentsForToday(doctorId);

    LocalDateTime startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
    long completedThisWeek = appointmentRepository.countCompletedAppointmentsSince(doctorId, startOfWeek);

    Map<AppointmentStatus, Long> statusDistribution = appointmentRepository.countAppointmentsByStatus(doctorId)
      .stream()
      .collect(Collectors.toMap(
        row -> (AppointmentStatus) row[0],
        row -> (Long) row[1]
      ));

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

    List<Object[]> appointmentCounts = appointmentRepository.countAppointmentsFromDateGroupedByDay(thirtyDaysAgo);
    Map<LocalDate, Long> appointmentsByDay = appointmentCounts.stream()
      .collect(Collectors.toMap(
        row -> ((java.sql.Date) row[0]).toLocalDate(),
        row -> (Long) row[1]
      ));

    List<Object[]> firstAppointments = appointmentRepository.findFirstAppointmentDateForPatients(thirtyDaysAgo);
    Map<LocalDate, Long> newPatientsByDay = firstAppointments.stream()
      .collect(Collectors.groupingBy(
        row -> ((java.sql.Date) row[1]).toLocalDate(),
        Collectors.counting()
      ));

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

  @Override
  @Transactional(readOnly = true)
  public List<AppointmentResponse> getAppointmentsByPatientId(Long patientId) {
    return appointmentRepository.findByPatientIdAndAppointmentDateTimeBefore(patientId, LocalDateTime.now())
      .stream()
      .map(AppointmentResponse::fromEntity)
      .collect(Collectors.toList());
  }

  private Appointment findAppointmentByIdOrThrow(Long appointmentId) {
    return appointmentRepository.findById(appointmentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Agendamento com ID " + appointmentId + " não encontrado."));
  }
}