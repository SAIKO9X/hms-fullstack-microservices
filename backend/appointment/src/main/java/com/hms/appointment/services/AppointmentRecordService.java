package com.hms.appointment.services;

import com.hms.appointment.request.AppointmentRecordCreateRequest;
import com.hms.appointment.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.response.AppointmentRecordResponse;

public interface AppointmentRecordService {
  AppointmentRecordResponse createAppointmentRecord(AppointmentRecordCreateRequest request, Long doctorId);

  AppointmentRecordResponse getAppointmentRecordByAppointmentId(Long appointmentId, Long requesterId);

  AppointmentRecordResponse updateAppointmentRecord(Long recordId, AppointmentRecordUpdateRequest request, Long doctorId);
}