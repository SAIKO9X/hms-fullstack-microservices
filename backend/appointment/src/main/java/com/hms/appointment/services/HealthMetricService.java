package com.hms.appointment.services;

import com.hms.appointment.dto.request.HealthMetricCreateRequest;
import com.hms.appointment.dto.response.HealthMetricResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface HealthMetricService {
  HealthMetricResponse createHealthMetric(Long patientId, HealthMetricCreateRequest request);

  HealthMetricResponse getLatestHealthMetric(Long patientId);

  Page<HealthMetricResponse> getHealthMetricHistory(Long patientId, Pageable pageable);
}