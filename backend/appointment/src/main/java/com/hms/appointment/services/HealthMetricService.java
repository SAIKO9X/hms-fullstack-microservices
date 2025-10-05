package com.hms.appointment.services;

import com.hms.appointment.request.HealthMetricCreateRequest;
import com.hms.appointment.response.HealthMetricResponse;

import java.util.List;

public interface HealthMetricService {
  HealthMetricResponse createHealthMetric(Long patientId, HealthMetricCreateRequest request);

  HealthMetricResponse getLatestHealthMetric(Long patientId);

  List<HealthMetricResponse> getHealthMetricHistory(Long patientId);
}