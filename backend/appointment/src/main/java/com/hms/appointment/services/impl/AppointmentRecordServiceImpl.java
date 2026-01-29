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
      throw new SecurityException("Acesso negado.");
    }

    applyChanges(record, request);

    return AppointmentRecordResponse.fromEntity(recordRepository.save(record));
  }

  private void applyChanges(AppointmentRecord record, AppointmentRecordUpdateRequest request) {
    updateFieldIfChanged("chiefComplaint", record.getChiefComplaint(), request.chiefComplaint(), record::setChiefComplaint);
    updateFieldIfChanged("historyOfPresentIllness", record.getHistoryOfPresentIllness(), request.historyOfPresentIllness(), record::setHistoryOfPresentIllness);
    updateFieldIfChanged("physicalExamNotes", record.getPhysicalExamNotes(), request.physicalExamNotes(), record::setPhysicalExamNotes);
    updateFieldIfChanged("symptoms", record.getSymptoms(), request.symptoms(), record::setSymptoms);
    updateFieldIfChanged("diagnosisCid10", record.getDiagnosisCid10(), request.diagnosisCid10(), record::setDiagnosisCid10);
    updateFieldIfChanged("diagnosisDescription", record.getDiagnosisDescription(), request.diagnosisDescription(), record::setDiagnosisDescription);
    updateFieldIfChanged("treatmentPlan", record.getTreatmentPlan(), request.treatmentPlan(), record::setTreatmentPlan);
    updateFieldIfChanged("requestedTests", record.getRequestedTests(), request.requestedTests(), record::setRequestedTests);
    updateFieldIfChanged("notes", record.getNotes(), request.notes(), record::setNotes);
  }

  private <T> void updateFieldIfChanged(String fieldName, T currentValue, T newValue, java.util.function.Consumer<T> setter) {
    if (newValue != null && !Objects.equals(currentValue, newValue)) {
      AuditChangeTracker.addChange(fieldName, currentValue, newValue);
      setter.accept(newValue);
    }
  }
}