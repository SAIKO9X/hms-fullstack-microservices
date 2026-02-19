package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.AppointmentRecord;
import com.hms.appointment.entities.DoctorReadModel;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.repositories.AppointmentRecordRepository;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.appointment.services.AppointmentRecordService;
import com.hms.common.audit.AuditChangeTracker;
import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AppointmentRecordServiceImpl implements AppointmentRecordService {

  private final AppointmentRecordRepository recordRepository;
  private final AppointmentRepository appointmentRepository;
  private final DoctorReadModelRepository doctorReadModelRepository;
  private final PatientReadModelRepository patientReadModelRepository;

  @Override
  @Transactional
  public AppointmentRecordResponse createAppointmentRecord(AppointmentRecordCreateRequest request, Long userId) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new ResourceNotFoundException("Appointment", request.appointmentId()));

    DoctorReadModel doctor = doctorReadModelRepository.findByUserId(userId)
      .orElseThrow(() -> new AccessDeniedException("Perfil de médico não encontrado para o usuário atual."));

    if (!appointment.getDoctorId().equals(doctor.getDoctorId())) {
      throw new AccessDeniedException("Você não tem permissão para criar registro para esta consulta.");
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
  public AppointmentRecordResponse getAppointmentRecordByAppointmentId(Long appointmentId, Long requesterUserId) {
    return recordRepository.findByAppointmentId(appointmentId)
      .map(record -> {
        Appointment appointment = record.getAppointment();

        boolean isDoctorOwner = doctorReadModelRepository.findByUserId(requesterUserId)
          .map(doctor -> doctor.getDoctorId().equals(appointment.getDoctorId()))
          .orElse(false);

        boolean isPatientOwner = patientReadModelRepository.findByUserId(requesterUserId)
          .map(patient -> patient.getPatientId().equals(appointment.getPatientId()))
          .orElse(false);

        if (!isDoctorOwner && !isPatientOwner) {
          throw new AccessDeniedException("Acesso negado. Você não tem permissão para ver este registo.");
        }

        return AppointmentRecordResponse.fromEntity(record);
      })
      .orElse(null);
  }

  @Override
  @Transactional
  public AppointmentRecordResponse updateAppointmentRecord(Long recordId, AppointmentRecordUpdateRequest request, Long userId) {
    AppointmentRecord record = recordRepository.findById(recordId)
      .orElseThrow(() -> new ResourceNotFoundException("AppointmentRecord", recordId));

    DoctorReadModel doctor = doctorReadModelRepository.findByUserId(userId)
      .orElseThrow(() -> new AccessDeniedException("Perfil de médico não encontrado."));

    if (!record.getAppointment().getDoctorId().equals(doctor.getDoctorId())) {
      throw new AccessDeniedException("Você não tem permissão para editar este prontuário.");
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