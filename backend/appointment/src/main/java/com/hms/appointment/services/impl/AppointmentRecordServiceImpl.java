package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.AppointmentRecord;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.repositories.AppointmentRecordRepository;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.services.AppointmentRecordService;
import com.hms.common.audit.AuditChangeTracker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AppointmentRecordServiceImpl implements AppointmentRecordService {

  private final AppointmentRecordRepository recordRepository;
  private final AppointmentRepository appointmentRepository;

  @Override
  @Transactional
  public AppointmentRecordResponse createAppointmentRecord(AppointmentRecordCreateRequest request, Long doctorId) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new AppointmentNotFoundException("Consulta não encontrada."));

    if (!appointment.getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado.");
    }

    AppointmentRecord newRecord = AppointmentRecord.builder()
      .appointment(appointment)
      .chiefComplaint(request.chiefComplaint())
      .historyOfPresentIllness(request.historyOfPresentIllness())
      .physicalExamNotes(request.physicalExamNotes())
      .symptoms(request.symptoms())
      .diagnosisCid10(request.diagnosisCid10())
      .diagnosisDescription(request.diagnosisDescription())
      .treatmentPlan(request.treatmentPlan())
      .requestedTests(request.requestedTests())
      .notes(request.notes())
      .build();

    AppointmentRecord savedRecord = recordRepository.save(newRecord);

    appointment.setStatus(AppointmentStatus.COMPLETED);
    appointmentRepository.save(appointment);

    return AppointmentRecordResponse.fromEntity(savedRecord);
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentRecordResponse getAppointmentRecordByAppointmentId(Long appointmentId, Long requesterId) {
    return recordRepository.findByAppointmentId(appointmentId)
      .map(record -> {
        Appointment appointment = record.getAppointment();
        if (!appointment.getDoctorId().equals(requesterId) && !appointment.getPatientId().equals(requesterId)) {
          throw new SecurityException("Acesso negado. Você não tem permissão para ver este registo.");
        }
        return AppointmentRecordResponse.fromEntity(record);
      })
      .orElse(null);
  }

  @Override
  @Transactional
  public AppointmentRecordResponse updateAppointmentRecord(Long recordId, AppointmentRecordUpdateRequest request, Long doctorId) {
    AppointmentRecord record = recordRepository.findById(recordId)
      .orElseThrow(() -> new AppointmentNotFoundException("Registro com ID " + recordId + " não encontrado."));

    if (!record.getAppointment().getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado. Apenas o médico responsável pode editar este registro.");
    }
    if (request.chiefComplaint() != null && !Objects.equals(record.getChiefComplaint(), request.chiefComplaint())) {
      AuditChangeTracker.addChange("chiefComplaint", record.getChiefComplaint(), request.chiefComplaint());
      record.setChiefComplaint(request.chiefComplaint());
    }
    if (request.historyOfPresentIllness() != null && !Objects.equals(record.getHistoryOfPresentIllness(), request.historyOfPresentIllness())) {
      AuditChangeTracker.addChange("historyOfPresentIllness", record.getHistoryOfPresentIllness(), request.historyOfPresentIllness());
      record.setHistoryOfPresentIllness(request.historyOfPresentIllness());
    }
    if (request.physicalExamNotes() != null && !Objects.equals(record.getPhysicalExamNotes(), request.physicalExamNotes())) {
      AuditChangeTracker.addChange("physicalExamNotes", record.getPhysicalExamNotes(), request.physicalExamNotes());
      record.setPhysicalExamNotes(request.physicalExamNotes());
    }
    if (request.symptoms() != null && !Objects.equals(record.getSymptoms(), request.symptoms())) {
      AuditChangeTracker.addChange("symptoms", record.getSymptoms(), request.symptoms());
      record.setSymptoms(request.symptoms());
    }
    if (request.diagnosisCid10() != null && !Objects.equals(record.getDiagnosisCid10(), request.diagnosisCid10())) {
      AuditChangeTracker.addChange("diagnosisCid10", record.getDiagnosisCid10(), request.diagnosisCid10());
      record.setDiagnosisCid10(request.diagnosisCid10());
    }
    if (request.diagnosisDescription() != null && !Objects.equals(record.getDiagnosisDescription(), request.diagnosisDescription())) {
      AuditChangeTracker.addChange("diagnosisDescription", record.getDiagnosisDescription(), request.diagnosisDescription());
      record.setDiagnosisDescription(request.diagnosisDescription());
    }
    if (request.treatmentPlan() != null && !Objects.equals(record.getTreatmentPlan(), request.treatmentPlan())) {
      AuditChangeTracker.addChange("treatmentPlan", record.getTreatmentPlan(), request.treatmentPlan());
      record.setTreatmentPlan(request.treatmentPlan());
    }
    if (request.requestedTests() != null && !Objects.equals(record.getRequestedTests(), request.requestedTests())) {
      AuditChangeTracker.addChange("requestedTests", record.getRequestedTests(), request.requestedTests());
      record.setRequestedTests(request.requestedTests());
    }
    if (request.notes() != null && !Objects.equals(record.getNotes(), request.notes())) {
      AuditChangeTracker.addChange("notes", record.getNotes(), request.notes());
      record.setNotes(request.notes());
    }

    return AppointmentRecordResponse.fromEntity(recordRepository.save(record));
  }
}