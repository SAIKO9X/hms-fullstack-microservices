package com.hms.appointment.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "tb_medical_documents")
public class MedicalDocument {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long patientId;

  // Associa a uma consulta específica
  private Long appointmentId;

  @Column(nullable = false)
  private String documentName; // Ex: "Exame de Sangue - Hemograma"

  @Column(nullable = false)
  private String documentType; // Ex: "BLOOD_REPORT", "XRAY", "PRESCRIPTION"

  @Column(nullable = false)
  private String mediaUrl; // URL retornada pelo media-service (ex: "/media/123")

  @CreationTimestamp
  private LocalDateTime uploadedAt;
}