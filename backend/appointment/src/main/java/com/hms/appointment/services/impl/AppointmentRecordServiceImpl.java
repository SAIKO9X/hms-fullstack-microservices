package com.hms.appointment.services.impl;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.AppointmentRecord;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.repositories.AppointmentRecordRepository;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.appointment.services.AppointmentRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppointmentRecordServiceImpl implements AppointmentRecordService {

  private final AppointmentRecordRepository recordRepository;
  private final AppointmentRepository appointmentRepository;

  @Override
  @Transactional
  public AppointmentRecordResponse createAppointmentRecord(AppointmentRecordCreateRequest request, Long doctorId) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new AppointmentNotFoundException("Consulta com ID " + request.appointmentId() + " não encontrada."));

    if (!appointment.getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado. Apenas o médico responsável pode criar o registo desta consulta.");
    }

    if (recordRepository.findByAppointmentId(request.appointmentId()).isPresent()) {
      throw new InvalidUpdateException("Um registo para esta consulta já existe.");
    }

    AppointmentRecord newRecord = new AppointmentRecord();
    newRecord.setAppointment(appointment);
    newRecord.setSymptoms(request.symptoms());
    newRecord.setDiagnosis(request.diagnosis());
    newRecord.setTests(request.tests());
    newRecord.setNotes(request.notes());
    newRecord.setPrescription(request.prescription());

    AppointmentRecord savedRecord = recordRepository.save(newRecord);
    return AppointmentRecordResponse.fromEntity(savedRecord);
  }

  @Override
  @Transactional(readOnly = true)
  public AppointmentRecordResponse getAppointmentRecordByAppointmentId(Long appointmentId, Long requesterId) {
    return recordRepository.findByAppointmentId(appointmentId)
      .map(record -> {
        // Validação de segurança
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
      .orElseThrow(() -> new AppointmentNotFoundException("Registo com ID " + recordId + " não encontrado."));

    if (!record.getAppointment().getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado. Apenas o médico responsável pode editar este registo.");
    }

    record.setSymptoms(request.symptoms());
    record.setDiagnosis(request.diagnosis());
    record.setTests(request.tests());
    record.setNotes(request.notes());
    record.setPrescription(request.prescription());

    return AppointmentRecordResponse.fromEntity(recordRepository.save(record));
  }
}