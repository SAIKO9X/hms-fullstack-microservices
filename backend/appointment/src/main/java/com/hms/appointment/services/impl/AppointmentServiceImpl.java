package com.hms.appointment.services.impl;

import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.dto.event.AppointmentEvent;
import com.hms.appointment.dto.event.AppointmentStatusChangedEvent;
import com.hms.appointment.dto.event.WaitlistNotificationEvent;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.request.AvailabilityRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.entities.*;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.enums.AppointmentType;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.exceptions.ProfileNotFoundException;
import com.hms.appointment.exceptions.SchedulingConflictException;
import com.hms.appointment.repositories.*;
import com.hms.appointment.services.AppointmentService;
import com.hms.common.audit.AuditChangeTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

  private final AppointmentRepository appointmentRepository;
  private final DoctorReadModelRepository doctorReadModelRepository;
  private final PatientReadModelRepository patientReadModelRepository;
  private final DoctorAvailabilityRepository availabilityRepository;
  private final DoctorUnavailabilityRepository unavailabilityRepository;
  private final WaitlistRepository waitlistRepository;
  private final RabbitTemplate rabbitTemplate;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Override
  @Transactional
  public AppointmentResponse createAppointment(Long patientId, AppointmentCreateRequest request) {
    if (!patientReadModelRepository.existsById(patientId))
      throw new ProfileNotFoundException("Paciente não encontrado.");
    if (!doctorReadModelRepository.existsById(request.doctorId()))
      throw new ProfileNotFoundException("Médico não encontrado.");

    int duration = request.duration() != null ? request.duration() : 60;
    LocalDateTime start = request.appointmentDateTime();
    LocalDateTime end = start.plusMinutes(duration);

    validateNewAppointment(patientId, request.doctorId(), start, end);

    Appointment appointment = new Appointment();
    appointment.setPatientId(patientId);
    appointment.setDoctorId(request.doctorId());
    appointment.setAppointmentDateTime(start);
    appointment.setDuration(duration);
    appointment.setAppointmentEndTime(end);
    appointment.setReason(request.reason());
    appointment.setStatus(AppointmentStatus.SCHEDULED);

    if (request.type() == AppointmentType.ONLINE) {
      appointment.setType(AppointmentType.ONLINE);
      appointment.setMeetingUrl("https://meet.jit.si/hms-" + System.currentTimeMillis() + "-" + patientId);
    } else {
      appointment.setType(AppointmentType.IN_PERSON);
    }

    Appointment saved = appointmentRepository.save(appointment);
    publishStatusEvent(saved, "SCHEDULED", null);
    scheduleReminder(saved);

    return AppointmentResponse.fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentResponse getAppointmentById(Long appointmentId, Long requesterId) {
    Appointment app = findAppointmentByIdOrThrow(appointmentId);
    validateAccess(app, requesterId);
    return AppointmentResponse.fromEntity(app);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AppointmentResponse> getAppointmentsForPatient(Long patientId, Pageable pageable) {
    return appointmentRepository.findByPatientId(patientId, pageable).map(AppointmentResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AppointmentResponse> getAppointmentsForDoctor(Long doctorId, Pageable pageable) {
    return appointmentRepository.findByDoctorId(doctorId, pageable).map(AppointmentResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public List<AppointmentDetailResponse> getAppointmentDetailsForDoctor(Long doctorId, String dateFilter) {
    List<Appointment> appointments;

    if (dateFilter == null || "all".equalsIgnoreCase(dateFilter)) {
      appointments = appointmentRepository.findByDoctorId(doctorId);
    } else {
      var range = calculateDateRange(dateFilter);
      appointments = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, range.start(), range.end());
    }

    if (appointments.isEmpty()) return List.of();

    // cache local simples para evitar N+1 queries no DoctorReadModel
    DoctorReadModel doctor = doctorReadModelRepository.findById(doctorId)
      .orElse(new DoctorReadModel(doctorId, null, "Médico", "N/A", null));

    return appointments.stream()
      .map(app -> mapToDetailResponse(app, doctor))
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public AppointmentResponse rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long requesterId) {
    Appointment app = findAppointmentByIdOrThrow(appointmentId);
    validateAccess(app, requesterId);

    if (app.getStatus() != AppointmentStatus.SCHEDULED)
      throw new InvalidUpdateException("Apenas consultas agendadas podem ser remarcadas.");

    int duration = app.getDuration() != null ? app.getDuration() : 60;
    LocalDateTime newEnd = newDateTime.plusMinutes(duration);

    if (appointmentRepository.hasDoctorConflictExcludingId(app.getDoctorId(), newDateTime, newEnd, appointmentId)) {
      throw new SchedulingConflictException("Conflito de horário com outra consulta.");
    }
    validateAvailability(app.getDoctorId(), newDateTime, newEnd);

    LocalDateTime oldDate = app.getAppointmentDateTime();
    AuditChangeTracker.addChange("appointmentDateTime", oldDate, newDateTime);

    app.setAppointmentDateTime(newDateTime);
    app.setAppointmentEndTime(newEnd);
    app.setReminder24hSent(false);
    app.setReminder1hSent(false);

    Appointment saved = appointmentRepository.save(app);
    publishStatusEvent(saved, "RESCHEDULED", "De: " + oldDate);
    checkAndNotifyWaitlist(saved.getDoctorId(), oldDate);
    scheduleReminder(saved);

    return AppointmentResponse.fromEntity(saved);
  }

  @Override
  @Transactional
  public AppointmentResponse cancelAppointment(Long appointmentId, Long requesterId) {
    Appointment app = findAppointmentByIdOrThrow(appointmentId);
    validateAccess(app, requesterId);

    if (app.getStatus() != AppointmentStatus.SCHEDULED)
      throw new InvalidUpdateException("Status inválido para cancelamento.");

    AuditChangeTracker.addChange("status", app.getStatus(), AppointmentStatus.CANCELED);
    app.setStatus(AppointmentStatus.CANCELED);

    Appointment saved = appointmentRepository.save(app);
    publishStatusEvent(saved, "CANCELED", "Solicitado pelo usuário");
    checkAndNotifyWaitlist(app.getDoctorId(), app.getAppointmentDateTime());

    return AppointmentResponse.fromEntity(saved);
  }

  @Override
  @Transactional
  public AppointmentResponse completeAppointment(Long appointmentId, String notes, Long doctorId) {
    Appointment app = findAppointmentByIdOrThrow(appointmentId);
    if (!app.getDoctorId().equals(doctorId)) throw new SecurityException("Apenas o médico responsável pode finalizar.");

    if (app.getStatus() != AppointmentStatus.SCHEDULED && app.getStatus() != AppointmentStatus.COMPLETED) {
      throw new InvalidUpdateException("Status inválido.");
    }

    if (!Objects.equals(app.getNotes(), notes)) AuditChangeTracker.addChange("notes", app.getNotes(), notes);
    if (app.getStatus() != AppointmentStatus.COMPLETED)
      AuditChangeTracker.addChange("status", app.getStatus(), AppointmentStatus.COMPLETED);

    app.setStatus(AppointmentStatus.COMPLETED);
    app.setNotes(notes);
    return AppointmentResponse.fromEntity(appointmentRepository.save(app));
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentDetailResponse getAppointmentDetailsById(Long appointmentId, Long requesterId) {
    Appointment app = findAppointmentByIdOrThrow(appointmentId);
    validateAccess(app, requesterId);

    DoctorReadModel doctor = doctorReadModelRepository.findById(app.getDoctorId()).orElse(null);
    return mapToDetailResponse(app, doctor);
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentResponse getNextAppointmentForPatient(Long patientId) {
    return appointmentRepository.findFirstByPatientIdAndStatusAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
      patientId, AppointmentStatus.SCHEDULED, LocalDateTime.now()).map(AppointmentResponse::fromEntity).orElse(null);
  }

  @Override
  public AppointmentStatsResponse getAppointmentStatsForPatient(Long patientId) {
    List<Appointment> apps = appointmentRepository.findByPatientId(patientId);
    return new AppointmentStatsResponse(
      apps.size(),
      apps.stream().filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED).count(),
      apps.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count(),
      apps.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELED).count()
    );
  }

  @Override
  public DoctorDashboardStatsResponse getDoctorDashboardStats(Long doctorId) {
    long today = appointmentRepository.countAppointmentsForToday(doctorId);
    long weekCompleted = appointmentRepository.countCompletedAppointmentsSince(doctorId, LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay());

    Map<AppointmentStatus, Long> distribution = new EnumMap<>(AppointmentStatus.class);
    Arrays.stream(AppointmentStatus.values()).forEach(s -> distribution.put(s, 0L));

    appointmentRepository.countAppointmentsByStatus(doctorId).forEach(row ->
      distribution.put((AppointmentStatus) row[0], (Long) row[1]));

    return new DoctorDashboardStatsResponse(today, weekCompleted, distribution);
  }

  @Override
  public long countUniquePatientsForDoctor(Long doctorId) {
    return appointmentRepository.countDistinctPatientsByDoctorId(doctorId);
  }

  @Override
  public List<PatientGroupResponse> getPatientGroupsForDoctor(Long doctorId) {
    var groups = Map.of(
      "Diabéticos", List.of("diabetes", "diabético", "glicemia"),
      "Hipertensos", List.of("hipertensão", "pressão alta", "has"),
      "Cardíacos", List.of("cardíaco", "cardiopatia", "infarto")
    );

    return groups.entrySet().stream()
      .map(entry -> {
        Set<Long> ids = new HashSet<>();
        entry.getValue().forEach(k -> ids.addAll(appointmentRepository.findDistinctPatientIdsByDoctorAndDiagnosisKeyword(doctorId, k)));
        return new PatientGroupResponse(entry.getKey(), ids.size());
      })
      .filter(g -> g.patientCount() > 0)
      .sorted((a, b) -> Long.compare(b.patientCount(), a.patientCount()))
      .toList();
  }

  @Override
  public List<DailyActivityDto> getDailyActivityStats() {
    LocalDateTime start = LocalDateTime.now().minusDays(30);
    Map<LocalDate, Long> appointments = mapQueryResults(appointmentRepository.countAppointmentsFromDateGroupedByDay(start));
    Map<LocalDate, Long> newPatients = mapQueryResults(appointmentRepository.findFirstAppointmentDateForPatients(start));

    return IntStream.range(0, 30)
      .mapToObj(i -> LocalDate.now().minusDays(i))
      .map(d -> new DailyActivityDto(d, newPatients.getOrDefault(d, 0L), appointments.getOrDefault(d, 0L)))
      .sorted(Comparator.comparing(DailyActivityDto::date))
      .toList();
  }

  @Override
  public long countAllAppointmentsForToday() {
    return appointmentRepository.countAllAppointmentsForToday();
  }

  @Override
  @Transactional(readOnly = true)
  public List<AppointmentResponse> getAppointmentsByPatientId(Long patientId) {
    return appointmentRepository.findByPatientIdAndAppointmentDateTimeBefore(patientId, LocalDateTime.now())
      .stream().map(AppointmentResponse::fromEntity).toList();
  }

  @Override
  @Transactional
  public void joinWaitlist(Long patientId, AppointmentCreateRequest request) {
    int duration = request.duration() != null ? request.duration() : 60;
    if (!appointmentRepository.hasDoctorConflict(request.doctorId(), request.appointmentDateTime(), request.appointmentDateTime().plusMinutes(duration))) {
      throw new InvalidUpdateException("Horário disponível. Agende diretamente.");
    }
    if (waitlistRepository.existsByPatientIdAndDoctorIdAndDate(patientId, request.doctorId(), request.appointmentDateTime().toLocalDate())) {
      throw new InvalidUpdateException("Você já está na fila para este dia.");
    }

    PatientReadModel p = patientReadModelRepository.findById(patientId).orElseThrow(() -> new ProfileNotFoundException("Paciente não encontrado."));
    waitlistRepository.save(new WaitlistEntry(null, request.doctorId(), patientId, p.getFullName(), p.getEmail(), request.appointmentDateTime().toLocalDate(), LocalDateTime.now()));
  }

  @Override
  public List<DoctorPatientSummaryDto> getPatientsForDoctor(Long doctorId) {
    return appointmentRepository.findPatientsSummaryByDoctor(doctorId).stream()
      .map(p -> new DoctorPatientSummaryDto(
        p.getPatientId(), p.getUserId(), p.getPatientName(), p.getPatientEmail(),
        p.getTotalAppointments(), p.getLastAppointmentDate(),
        p.getLastAppointmentDate().isAfter(LocalDateTime.now().minusMonths(6)) ? "ACTIVE" : "INACTIVE",
        p.getProfilePicture()
      )).toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorSummaryProjection> getMyDoctors(Long patientId) {
    return appointmentRepository.findDoctorsSummaryByPatient(patientId);
  }

  @Override
  @Transactional
  public AvailabilityResponse addAvailability(Long doctorId, AvailabilityRequest request) {
    if (request.startTime().isAfter(request.endTime()))
      throw new InvalidUpdateException("Início deve ser antes do fim.");

    boolean conflict = availabilityRepository.findByDoctorId(doctorId).stream()
      .filter(s -> s.getDayOfWeek() == request.dayOfWeek())
      .anyMatch(s -> request.startTime().isBefore(s.getEndTime()) && request.endTime().isAfter(s.getStartTime()));

    if (conflict) throw new InvalidUpdateException("Conflito com horário existente.");

    DoctorAvailability saved = availabilityRepository.save(DoctorAvailability.builder()
      .doctorId(doctorId).dayOfWeek(request.dayOfWeek()).startTime(request.startTime()).endTime(request.endTime()).build());
    return new AvailabilityResponse(saved.getId(), saved.getDayOfWeek(), saved.getStartTime(), saved.getEndTime());
  }

  @Override
  public List<AvailabilityResponse> getDoctorAvailability(Long doctorId) {
    return availabilityRepository.findByDoctorId(doctorId).stream()
      .map(a -> new AvailabilityResponse(a.getId(), a.getDayOfWeek(), a.getStartTime(), a.getEndTime())).toList();
  }

  @Override
  public void deleteAvailability(Long id) {
    availabilityRepository.deleteById(id);
  }

  @Override
  public List<Long> getActiveDoctorIdsInLastHour() {
    return appointmentRepository.findByAppointmentDateTimeBetween(LocalDateTime.now().minusHours(1), LocalDateTime.now())
      .stream().map(Appointment::getDoctorId).distinct().toList();
  }

  // --- PRIVATE HELPERS ---

  private void validateNewAppointment(Long patientId, Long doctorId, LocalDateTime start, LocalDateTime end) {
    validateBusinessHours(start);
    if (start.isBefore(LocalDateTime.now().plusHours(2)))
      throw new InvalidUpdateException("Antecedência mínima de 2h.");
    if (start.isAfter(LocalDateTime.now().plusMonths(3)))
      throw new InvalidUpdateException("Antecedência máxima de 3 meses.");
    if (appointmentRepository.countByPatientIdAndDate(patientId, start.toLocalDate()) >= 2)
      throw new InvalidUpdateException("Limite diário atingido.");

    validateAvailability(doctorId, start, end);

    if (appointmentRepository.hasDoctorConflict(doctorId, start, end))
      throw new SchedulingConflictException("Médico ocupado.");
    if (appointmentRepository.hasPatientConflict(patientId, start, end))
      throw new SchedulingConflictException("Você já tem consulta neste horário.");
  }

  private void validateAvailability(Long doctorId, LocalDateTime start, LocalDateTime end) {
    boolean isBlocked = unavailabilityRepository.hasUnavailability(doctorId, start, end);
    if (isBlocked) throw new SchedulingConflictException("Médico indisponível (Bloqueio).");

    List<DoctorAvailability> slots = availabilityRepository.findByDoctorId(doctorId);
    if (slots.isEmpty())
      return; // Se não tem agenda definida, assume disponível (ou bloqueia tudo, dependendo da regra de negócio)

    boolean isCovered = slots.stream().anyMatch(slot ->
      slot.getDayOfWeek() == start.getDayOfWeek() &&
        !start.toLocalTime().isBefore(slot.getStartTime()) &&
        !end.toLocalTime().isAfter(slot.getEndTime()));

    if (!isCovered) throw new InvalidUpdateException("Fora do horário de atendimento do médico.");
  }

  private void validateBusinessHours(LocalDateTime date) {
    LocalTime t = date.toLocalTime();
    if (t.isBefore(LocalTime.of(6, 0)) || t.isAfter(LocalTime.of(22, 0)))
      throw new InvalidUpdateException("Horário inválido (06h-22h).");
  }

  private void validateAccess(Appointment app, Long requesterId) {
    if (!app.getPatientId().equals(requesterId) && !app.getDoctorId().equals(requesterId)) {
      throw new SecurityException("Acesso negado.");
    }
  }

  private Appointment findAppointmentByIdOrThrow(Long id) {
    return appointmentRepository.findById(id).orElseThrow(() -> new AppointmentNotFoundException("Consulta não encontrada."));
  }

  private DateRange calculateDateRange(String filter) {
    LocalDateTime now = LocalDate.now().atStartOfDay();
    if ("today".equalsIgnoreCase(filter)) return new DateRange(now, now.plusDays(1).minusNanos(1));
    if ("week".equalsIgnoreCase(filter))
      return new DateRange(now.with(DayOfWeek.MONDAY), now.with(DayOfWeek.SUNDAY).plusDays(1).minusNanos(1));
    if ("month".equalsIgnoreCase(filter))
      return new DateRange(now.withDayOfMonth(1), now.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1).minusNanos(1));
    return new DateRange(now.minusYears(1), now.plusYears(1)); // Default fallback
  }

  private AppointmentDetailResponse mapToDetailResponse(Appointment app, DoctorReadModel doctor) {
    PatientReadModel p = patientReadModelRepository.findById(app.getPatientId())
      .orElse(new PatientReadModel(app.getPatientId(), null, "Paciente", "N/A", null, null));
    String docName = (doctor != null) ? doctor.getFullName() : "Dr. Desconhecido";
    return new AppointmentDetailResponse(app.getId(), app.getPatientId(), p.getFullName(), p.getPhoneNumber(),
      app.getDoctorId(), docName, app.getAppointmentDateTime(), app.getReason(), app.getStatus());
  }

  private Map<LocalDate, Long> mapQueryResults(List<Object[]> results) {
    return results.stream().collect(Collectors.toMap(
      r -> ((java.sql.Date) r[0]).toLocalDate(), r -> (Long) r[1]
    ));
  }

  private void publishStatusEvent(Appointment app, String status, String notes) {
    try {
      var patient = patientReadModelRepository.findById(app.getPatientId()).orElse(null);
      var doctor = doctorReadModelRepository.findById(app.getDoctorId()).orElse(null);
      if (patient != null && doctor != null) {
        rabbitTemplate.convertAndSend(exchange, "appointment.status.changed", new AppointmentStatusChangedEvent(
          app.getId(), app.getPatientId(), patient.getEmail(), patient.getFullName(), doctor.getFullName(),
          app.getAppointmentDateTime(), status, notes
        ));
      }
    } catch (Exception e) {
      log.error("Erro RabbitMQ Status: {}", e.getMessage());
    }
  }

  private void scheduleReminder(Appointment app) {
    try {
      long delay = Duration.between(LocalDateTime.now(), app.getAppointmentDateTime().minusHours(24)).toMillis();
      if (delay > 0) {
        var event = new AppointmentEvent(app.getId(), app.getPatientId(), "email-placeholder", "dr-placeholder", app.getAppointmentDateTime(), app.getMeetingUrl());
        rabbitTemplate.convertAndSend(RabbitMQConfig.DELAYED_EXCHANGE, RabbitMQConfig.REMINDER_ROUTING_KEY, event, m -> {
          m.getMessageProperties().setHeader("x-delay", delay);
          return m;
        });
      }
    } catch (Exception e) {
      log.error("Erro RabbitMQ Lembrete: {}", e.getMessage());
    }
  }

  private void checkAndNotifyWaitlist(Long doctorId, LocalDateTime date) {
    try {
      waitlistRepository.findFirstByDoctorIdAndDateOrderByCreatedAtAsc(doctorId, date.toLocalDate()).ifPresent(entry -> {
        rabbitTemplate.convertAndSend(exchange, RabbitMQConfig.WAITLIST_ROUTING_KEY,
          new WaitlistNotificationEvent(entry.getPatientEmail(), entry.getPatientName(), "Dr. Disponível", date));
        waitlistRepository.delete(entry);
      });
    } catch (Exception e) {
      log.error("Erro Waitlist: {}", e.getMessage());
    }
  }

  private record DateRange(LocalDateTime start, LocalDateTime end) {
  }
}