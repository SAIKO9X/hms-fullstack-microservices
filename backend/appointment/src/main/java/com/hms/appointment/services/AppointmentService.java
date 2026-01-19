package com.hms.appointment.services;

import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.request.AvailabilityRequest;
import com.hms.appointment.dto.response.*;
import com.hms.appointment.repositories.DoctorSummaryProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {

  AppointmentResponse createAppointment(Long patientId, AppointmentCreateRequest request);

  AppointmentResponse getAppointmentById(Long appointmentId, Long requesterId);

  Page<AppointmentResponse> getAppointmentsForPatient(Long patientId, Pageable pageable);

  Page<AppointmentResponse> getAppointmentsForDoctor(Long doctorId, Pageable pageable);

  List<AppointmentDetailResponse> getAppointmentDetailsForDoctor(Long doctorId, String dateFilter);

  AppointmentResponse rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long requesterId);

  AppointmentResponse cancelAppointment(Long appointmentId, Long requesterId);

  AppointmentResponse completeAppointment(Long appointmentId, String notes, Long doctorId);

  AppointmentResponse getNextAppointmentForPatient(Long patientId);

  AppointmentStatsResponse getAppointmentStatsForPatient(Long patientId);

  DoctorDashboardStatsResponse getDoctorDashboardStats(Long doctorId);

  long countUniquePatientsForDoctor(Long doctorId);

  List<PatientGroupResponse> getPatientGroupsForDoctor(Long doctorId);

  List<DailyActivityDto> getDailyActivityStats();

  List<AppointmentResponse> getAppointmentsByPatientId(Long patientId);

  List<DoctorPatientSummaryDto> getPatientsForDoctor(Long doctorId);

  void joinWaitlist(Long patientId, AppointmentCreateRequest request);

  long countAllAppointmentsForToday();

  AvailabilityResponse addAvailability(Long doctorId, AvailabilityRequest request);

  List<AvailabilityResponse> getDoctorAvailability(Long doctorId);

  void deleteAvailability(Long availabilityId);

  List<DoctorSummaryProjection> getMyDoctors(Long patientId);
}