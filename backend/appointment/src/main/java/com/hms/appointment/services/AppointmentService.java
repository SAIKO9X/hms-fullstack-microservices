package com.hms.appointment.services;

import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.*;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {

  AppointmentResponse createAppointment(Long patientId, AppointmentCreateRequest request);

  AppointmentResponse getAppointmentById(Long appointmentId, Long requesterId);

  List<AppointmentResponse> getAppointmentsForPatient(Long patientId);

  List<AppointmentResponse> getAppointmentsForDoctor(Long doctorId);

  List<AppointmentDetailResponse> getAppointmentDetailsForDoctor(Long doctorId, String dateFilter);

  AppointmentResponse rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long requesterId);

  AppointmentResponse cancelAppointment(Long appointmentId, Long requesterId);

  AppointmentResponse completeAppointment(Long appointmentId, String notes, Long doctorId);

  AppointmentResponse getNextAppointmentForPatient(Long patientId);

  AppointmentStatsResponse getAppointmentStatsForPatient(Long patientId);

  DoctorDashboardStatsResponse getDoctorDashboardStats(Long doctorId);

  long countUniquePatientsForDoctor(Long doctorId);

  List<PatientGroupResponse> getPatientGroupsForDoctor(Long doctorId);
}