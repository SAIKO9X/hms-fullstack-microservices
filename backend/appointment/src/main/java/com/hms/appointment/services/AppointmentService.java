package com.hms.appointment.services;

import com.hms.appointment.request.AppointmentCreateRequest;
import com.hms.appointment.response.AppointmentDetailResponse;
import com.hms.appointment.response.AppointmentResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {

  // --- Métodos de Criação ---
  AppointmentResponse createAppointment(Long patientId, AppointmentCreateRequest request);

  // --- Métodos de Busca ---
  AppointmentResponse getAppointmentById(Long appointmentId, Long requesterId);

  List<AppointmentResponse> getAppointmentsForPatient(Long patientId);

  List<AppointmentResponse> getAppointmentsForDoctor(Long doctorId);

  List<AppointmentDetailResponse> getAppointmentDetailsForDoctor(Long doctorId);

  // --- Métodos de Atualização ---
  AppointmentResponse rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long requesterId);

  AppointmentResponse cancelAppointment(Long appointmentId, Long requesterId);

  AppointmentResponse completeAppointment(Long appointmentId, String notes, Long doctorId);
}