package com.hms.appointment.entities;

import com.hms.appointment.enums.DocumentType;
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

  @Column(nullable = false)
  private Long uploadedByUserId;

  private Long appointmentId;

  @Column(nullable = false)
  private String documentName; // Ex: "Exame de Sangue - Hemograma"

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private DocumentType documentType;

  @Column(nullable = false)
  private String mediaUrl; // URL retornada pelo media-service (ex: "/media/123")

  @CreationTimestamp
  private LocalDateTime uploadedAt;

  @Column(name = "is_verified", nullable = false)
  private boolean isVerified = false;
}