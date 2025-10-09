package com.hms.appointment.services;

import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;

import java.util.List;

public interface AdverseEffectReportService {
  AdverseEffectReportResponse createReport(Long patientId, AdverseEffectReportCreateRequest request);

  List<AdverseEffectReportResponse> getReportsByDoctorId(Long doctorId);

  AdverseEffectReportResponse markAsReviewed(Long reportId, Long doctorId);
}