package com.hms.appointment.dto.response;

import com.hms.appointment.entities.HealthMetric;

import java.time.LocalDateTime;

public record HealthMetricResponse(
  Long id,
  Long patientId,
  String bloodPressure,
  Double glucoseLevel,
  Double weight,
  Double height,
  Double bmi,
  Integer heartRate,
  LocalDateTime recordedAt
) {
  public static HealthMetricResponse fromEntity(HealthMetric metric) {
    return new HealthMetricResponse(
      metric.getId(),
      metric.getPatientId(),
      metric.getBloodPressure(),
      metric.getGlucoseLevel(),
      metric.getWeight(),
      metric.getHeight(),
      metric.getBmi(),
      metric.getHeartRate(),
      metric.getRecordedAt()
    );
  }
}