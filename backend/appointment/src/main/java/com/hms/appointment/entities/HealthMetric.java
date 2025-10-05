package com.hms.appointment.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "tb_health_metrics")
public class HealthMetric {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long patientId;

  private String bloodPressure; // Ex: "120/80"
  private Double glucoseLevel;  // Ex: 99.5
  private Double weight;        // Ex: 75.5 (kg)
  private Double height;        // Ex: 1.75 (m)
  private Double bmi;           // Ex: 24.5
  private Integer heartRate;    // Ex: 72 (bpm)

  @CreationTimestamp
  private LocalDateTime recordedAt; // Data e hora do registo
}