package com.hms.appointment.services.impl;

import com.hms.appointment.dto.request.HealthMetricCreateRequest;
import com.hms.appointment.dto.response.HealthMetricResponse;
import com.hms.appointment.entities.HealthMetric;
import com.hms.appointment.repositories.HealthMetricRepository;
import com.hms.appointment.services.HealthMetricService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HealthMetricServiceImpl implements HealthMetricService {

  private final HealthMetricRepository healthMetricRepository;

  @Override
  @Transactional
  public HealthMetricResponse createHealthMetric(Long patientId, HealthMetricCreateRequest request) {
    HealthMetric metric = new HealthMetric();
    metric.setPatientId(patientId);
    metric.setBloodPressure(request.bloodPressure());
    metric.setGlucoseLevel(request.glucoseLevel());
    metric.setWeight(request.weight());
    metric.setHeight(request.height());
    metric.setHeartRate(request.heartRate());

    // Calcula o IMC (BMI)
    if (request.height() != null && request.weight() != null && request.height() > 0) {
      double bmi = request.weight() / (request.height() * request.height());
      metric.setBmi(Math.round(bmi * 10.0) / 10.0); // Arredonda para 1 casa decimal
    }

    HealthMetric savedMetric = healthMetricRepository.save(metric);
    return HealthMetricResponse.fromEntity(savedMetric);
  }

  @Override
  @Transactional(readOnly = true)
  public HealthMetricResponse getLatestHealthMetric(Long patientId) {
    return healthMetricRepository.findFirstByPatientIdOrderByRecordedAtDesc(patientId)
      .map(HealthMetricResponse::fromEntity)
      .orElse(null); // Retorna nulo se não houver registos
  }

  @Override
  @Transactional(readOnly = true)
  public Page<HealthMetricResponse> getHealthMetricHistory(Long patientId, Pageable pageable) {
    return healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patientId, pageable)
      .map(HealthMetricResponse::fromEntity);
  }
}