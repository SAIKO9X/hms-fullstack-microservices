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
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.exceptions.ProfileNotFoundException;
import com.hms.appointment.exceptions.SchedulingConflictException;
import com.hms.appointment.repositories.*;
import com.hms.appointment.services.AppointmentService;
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
    if (!patientReadModelRepository.existsById(patientId)) {
      throw new ProfileNotFoundException("Perfil do paciente com ID " + patientId + " não encontrado.");
    }
    if (!doctorReadModelRepository.existsById(request.doctorId())) {
      throw new ProfileNotFoundException("Perfil do doutor com ID " + request.doctorId() + " não encontrado.");
    }

    // validações de Regras de Negócio
    validateBusinessHours(request.appointmentDateTime());
    validateMinimumAdvanceBooking(request.appointmentDateTime());
    validateMaximumAdvanceBooking(request.appointmentDateTime());
    validatePatientDailyLimit(patientId, request.appointmentDateTime());
    validateDoctorAvailability(request.doctorId(), request.appointmentDateTime());
    validateDoctorUnavailability(request.doctorId(), request.appointmentDateTime());
    LocalDateTime appointmentEnd = request.appointmentDateTime().plusHours(1);


    boolean hasOverlap = appointmentRepository.existsByDoctorIdAndTimeRange(
      request.doctorId(),
      request.appointmentDateTime(),
      appointmentEnd
    );

    if (hasOverlap) {
      throw new SchedulingConflictException("O médico já possui uma consulta agendada neste período.");
    }

    Appointment appointment = new Appointment();
    appointment.setPatientId(patientId);
    appointment.setDoctorId(request.doctorId());
    appointment.setAppointmentDateTime(request.appointmentDateTime());
    appointment.setReason(request.reason());
    appointment.setStatus(AppointmentStatus.SCHEDULED);

    Appointment savedAppointment = appointmentRepository.save(appointment);

    publishStatusEvent(savedAppointment, "SCHEDULED", null);
    scheduleReminder(savedAppointment);

    return AppointmentResponse.fromEntity(savedAppointment);
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
      .orElse(new DoctorReadModel(doctorId, null, "Médico (Sincronizando)", "N/A", null));

    List<AppointmentDetailResponse> appointmentDetails = new ArrayList<>();

    for (Appointment appointment : appointments) {
      PatientReadModel patient = patientReadModelRepository.findById(appointment.getPatientId())
        .orElse(new PatientReadModel(appointment.getPatientId(), null, "Paciente Desconhecido", "N/A", null, null));

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

    LocalDateTime oldDate = appointment.getAppointmentDateTime();

    appointment.setAppointmentDateTime(newDateTime);
    Appointment savedAppointment = appointmentRepository.save(appointment);

    publishStatusEvent(savedAppointment, "RESCHEDULED", "Nova data: " + newDateTime);

    checkAndNotifyWaitlist(savedAppointment.getDoctorId(), oldDate);

    scheduleReminder(savedAppointment);

    return AppointmentResponse.fromEntity(savedAppointment);
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
    Appointment savedAppointment = appointmentRepository.save(appointment);

    publishStatusEvent(savedAppointment, "CANCELED", "Cancelado pelo usuário");

    checkAndNotifyWaitlist(appointment.getDoctorId(), appointment.getAppointmentDateTime());

    return AppointmentResponse.fromEntity(savedAppointment);
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
      .orElse(new PatientReadModel(appointment.getPatientId(), null, "Paciente Desconhecido", "N/A", null, null));

    DoctorReadModel doctor = doctorReadModelRepository.findById(appointment.getDoctorId())
      .orElse(new DoctorReadModel(appointment.getDoctorId(), null, "Médico Desconhecido", "N/A", null));

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

  @Override
  @Transactional
  public void joinWaitlist(Long patientId, AppointmentCreateRequest request) {
    // só faz sentido entrar na fila se estiver cheio
    boolean isSlotTaken = appointmentRepository.existsByDoctorIdAndAppointmentDateTime(
      request.doctorId(),
      request.appointmentDateTime()
    );

    if (!isSlotTaken) {
      throw new InvalidUpdateException("Este horário está disponível. Você pode agendá-lo diretamente.");
    }

    // o paciente já está na fila para este médico/data
    boolean alreadyInQueue = waitlistRepository.existsByPatientIdAndDoctorIdAndDate(
      patientId,
      request.doctorId(),
      request.appointmentDateTime().toLocalDate()
    );

    if (alreadyInQueue) {
      throw new InvalidUpdateException("Você já está na fila de espera para este dia.");
    }

    PatientReadModel patient = patientReadModelRepository.findById(patientId)
      .orElseThrow(() -> new ProfileNotFoundException("Paciente não encontrado."));

    WaitlistEntry entry = new WaitlistEntry();
    entry.setDoctorId(request.doctorId());
    entry.setPatientId(patientId);
    entry.setPatientName(patient.getFullName());
    entry.setPatientEmail(patient.getEmail());
    entry.setDate(request.appointmentDateTime().toLocalDate());

    waitlistRepository.save(entry);
    log.info("Paciente {} entrou na fila de espera para o médico ID {}", patientId, request.doctorId());
  }

  @Override
  public List<DoctorPatientSummaryDto> getPatientsForDoctor(Long doctorId) {
    List<DoctorPatientSummaryProjection> projections = appointmentRepository.findPatientsSummaryByDoctor(doctorId);

    LocalDateTime limitDate = LocalDateTime.now().minusMonths(6);

    // Mapeia as projeções para DTOs, incluindo os novos campos userId e profilePicture
    return projections.stream()
      .map(p -> new DoctorPatientSummaryDto(
        p.getPatientId(),
        p.getUserId(),
        p.getPatientName(),
        p.getPatientEmail(),
        p.getTotalAppointments(),
        p.getLastAppointmentDate(),
        p.getLastAppointmentDate().isAfter(limitDate) ? "ACTIVE" : "INACTIVE",
        p.getProfilePicture()
      ))
      .toList();
  }

  @Override
  @Transactional
  public AvailabilityResponse addAvailability(Long doctorId, AvailabilityRequest request) {
    if (request.startTime().isAfter(request.endTime())) {
      throw new InvalidUpdateException("O horário de início deve ser anterior ao horário de fim.");
    }

    List<DoctorAvailability> existingSlots = availabilityRepository.findByDoctorId(doctorId);

    boolean hasConflict = existingSlots.stream()
      .filter(slot -> slot.getDayOfWeek() == request.dayOfWeek())
      .anyMatch(slot ->
        // verifica se o novo horário se sobrepõe a um existente
        (request.startTime().isBefore(slot.getEndTime()) && request.endTime().isAfter(slot.getStartTime()))
      );

    if (hasConflict) {
      throw new InvalidUpdateException("Você já possui um horário configurado que conflita com este período.");
    }

    DoctorAvailability availability = DoctorAvailability.builder()
      .doctorId(doctorId)
      .dayOfWeek(request.dayOfWeek())
      .startTime(request.startTime())
      .endTime(request.endTime())
      .build();

    DoctorAvailability saved = availabilityRepository.save(availability);

    return new AvailabilityResponse(
      saved.getId(),
      saved.getDayOfWeek(),
      saved.getStartTime(),
      saved.getEndTime()
    );
  }

  @Override
  @Transactional(readOnly = true)
  public List<AvailabilityResponse> getDoctorAvailability(Long doctorId) {
    return availabilityRepository.findByDoctorId(doctorId).stream()
      .map(a -> new AvailabilityResponse(a.getId(), a.getDayOfWeek(), a.getStartTime(), a.getEndTime()))
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void deleteAvailability(Long availabilityId) {
    availabilityRepository.deleteById(availabilityId);
  }

  private void validateDoctorAvailability(Long doctorId, LocalDateTime appointmentDateTime) {
    List<DoctorAvailability> settings = availabilityRepository.findByDoctorId(doctorId);

    if (settings.isEmpty()) return;

    DayOfWeek day = appointmentDateTime.getDayOfWeek();
    LocalTime appointmentStart = appointmentDateTime.toLocalTime();
    LocalTime appointmentEnd = appointmentStart.plusHours(1); // consulta de 1h

    boolean isCovered = settings.stream()
      .anyMatch(slot ->
        slot.getDayOfWeek() == day &&
          !appointmentStart.isBefore(slot.getStartTime()) &&
          !appointmentEnd.isAfter(slot.getEndTime())
      );

    if (!isCovered) {
      throw new InvalidUpdateException("O médico não atende neste horário/dia ou a consulta não cabe no período disponível.");
    }
  }

  private void validateMinimumAdvanceBooking(LocalDateTime appointmentDateTime) {
    LocalDateTime minimumTime = LocalDateTime.now().plusHours(2); // 2h de antecedência

    if (appointmentDateTime.isBefore(minimumTime)) {
      throw new InvalidUpdateException("Agendamentos devem ser feitos com pelo menos 2 horas de antecedência.");
    }
  }

  private void validateMaximumAdvanceBooking(LocalDateTime appointmentDateTime) {
    LocalDateTime maxTime = LocalDateTime.now().plusMonths(3); // Até 3 meses

    if (appointmentDateTime.isAfter(maxTime)) {
      throw new InvalidUpdateException("Não é possível agendar consultas com mais de 3 meses de antecedência.");
    }
  }

  private void validateBusinessHours(LocalDateTime appointmentDateTime) {
    LocalTime time = appointmentDateTime.toLocalTime();

    if (time.isBefore(LocalTime.of(6, 0)) || time.isAfter(LocalTime.of(22, 0))) {
      throw new InvalidUpdateException("Horário de agendamento deve estar entre 06:00 e 22:00.");
    }
  }

  private void validatePatientDailyLimit(Long patientId, LocalDateTime appointmentDateTime) {
    LocalDate date = appointmentDateTime.toLocalDate();
    long appointmentsOnDay = appointmentRepository.countByPatientIdAndDate(patientId, date);

    if (appointmentsOnDay >= 2) {
      throw new InvalidUpdateException("Você atingiu o limite de 2 agendamentos ativos para este dia.");
    }
  }

  private Appointment findAppointmentByIdOrThrow(Long appointmentId) {
    return appointmentRepository.findById(appointmentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Agendamento com ID " + appointmentId + " não encontrado."));
  }

  @Override
  @Transactional(readOnly = true)
  public List<DoctorSummaryProjection> getMyDoctors(Long patientId) {
    return appointmentRepository.findDoctorsSummaryByPatient(patientId);
  }

  // Método Auxiliar para publicar eventos de status de agendamento
  private void publishStatusEvent(Appointment appointment, String statusOverride, String notes) {
    try {
      PatientReadModel patient = patientReadModelRepository.findById(appointment.getPatientId())
        .orElse(new PatientReadModel(appointment.getPatientId(), null, "Paciente", null, "email@exemplo.com", null));

      DoctorReadModel doctor = doctorReadModelRepository.findById(appointment.getDoctorId())
        .orElse(new DoctorReadModel(appointment.getDoctorId(), null, "Médico", "Geral", null));

      AppointmentStatusChangedEvent event = new AppointmentStatusChangedEvent(
        appointment.getId(),
        appointment.getPatientId(),
        patient.getEmail(), // Email do ReadModel
        patient.getFullName(),
        doctor.getFullName(),
        appointment.getAppointmentDateTime(),
        statusOverride != null ? statusOverride : appointment.getStatus().name(),
        notes
      );

      String statusRoutingKey = "appointment.status.changed";
      rabbitTemplate.convertAndSend(exchange, statusRoutingKey, event);
      log.info("Evento de status de agendamento publicado: {}", statusOverride);

    } catch (Exception e) {
      log.error("Erro ao publicar evento de agendamento", e);
    }
  }

  private void scheduleReminder(Appointment appointment) {
    try {
      PatientReadModel patient = patientReadModelRepository.findById(appointment.getPatientId()).orElse(null);
      DoctorReadModel doctor = doctorReadModelRepository.findById(appointment.getDoctorId()).orElse(null);

      if (patient == null || doctor == null) return;

      // 24 horas antes da consulta
      long delay = calculateDelay(appointment.getAppointmentDateTime());

      if (delay > 0) {
        AppointmentEvent event = new AppointmentEvent(
          appointment.getId(),
          appointment.getPatientId(),
          patient.getEmail(),
          doctor.getFullName(),
          appointment.getAppointmentDateTime()
        );

        rabbitTemplate.convertAndSend(
          RabbitMQConfig.DELAYED_EXCHANGE,
          RabbitMQConfig.REMINDER_ROUTING_KEY,
          event,
          message -> {
            message.getMessageProperties().setHeader("x-delay", delay);
            return message;
          }
        );
        log.info("Lembrete agendado para consulta ID: {} com delay de {} ms", appointment.getId(), delay);
      }
    } catch (Exception e) {
      log.error("Falha ao agendar lembrete", e);
    }
  }

  private long calculateDelay(LocalDateTime appointmentTime) {
    LocalDateTime reminderTime = appointmentTime.minusHours(24);
    LocalDateTime now = LocalDateTime.now();

    // se a consulta é em menos de 24h, não agendar lembrete (ou agendar para daqui a pouco se quiser)
    if (now.isAfter(reminderTime)) {
      return -1;
    }

    return Duration.between(now, reminderTime).toMillis();
  }

  // Verifica a fila de espera e notifica o próximo paciente, se houver
  private void checkAndNotifyWaitlist(Long doctorId, LocalDateTime slotDateTime) {
    try {
      Optional<WaitlistEntry> entryOpt = waitlistRepository.findFirstByDoctorIdAndDateOrderByCreatedAtAsc(
        doctorId,
        slotDateTime.toLocalDate()
      );

      if (entryOpt.isPresent()) {
        WaitlistEntry entry = entryOpt.get();

        DoctorReadModel doctor = doctorReadModelRepository.findById(doctorId)
          .orElse(new DoctorReadModel(doctorId, null, "Médico", "Geral", null));

        WaitlistNotificationEvent event = new WaitlistNotificationEvent(
          entry.getPatientEmail(),
          entry.getPatientName(),
          doctor.getFullName(),
          slotDateTime
        );

        rabbitTemplate.convertAndSend(exchange, RabbitMQConfig.WAITLIST_ROUTING_KEY, event);
        log.info("Notificação de Waitlist enviada para paciente: {}", entry.getPatientEmail());

        waitlistRepository.delete(entry);
      }
    } catch (Exception e) {
      log.error("Erro ao processar fila de espera para médico ID: {}", doctorId, e);
    }
  }

  private void validateDoctorUnavailability(Long doctorId, LocalDateTime appointmentDateTime) {
    LocalDateTime appointmentEnd = appointmentDateTime.plusHours(1);

    boolean isBlocked = unavailabilityRepository.hasUnavailability(
      doctorId,
      appointmentDateTime,
      appointmentEnd
    );

    if (isBlocked) {
      throw new SchedulingConflictException("O médico não está disponível neste horário (Férias/Bloqueio administrativo).");
    }
  }
}