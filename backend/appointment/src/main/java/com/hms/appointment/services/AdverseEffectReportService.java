package com.hms.appointment.services;

import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdverseEffectReportService {
  AdverseEffectReportResponse createReport(Long patientId, AdverseEffectReportCreateRequest request);

  Page<AdverseEffectReportResponse> getReportsByDoctorId(Long doctorId, Pageable pageable);

  AdverseEffectReportResponse markAsReviewed(Long reportId, Long doctorId);
}