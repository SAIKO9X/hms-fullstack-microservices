package com.hms.appointment.entities;

import com.hms.appointment.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "tb_adverse_effect_reports")
public class AdverseEffectReport {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long patientId;

  @Column(nullable = false)
  private Long doctorId; // Para notificar o médico correto

  private Long prescriptionId; // Para saber a qual prescrição se refere

  @Lob
  private String description; // Descrição do efeito adverso

  @Enumerated(EnumType.STRING)
  private ReportStatus status;

  @CreationTimestamp
  private LocalDateTime reportedAt;
}

