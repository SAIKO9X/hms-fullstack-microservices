package com.hms.pharmacy.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tb_prescription_copy")
public class PrescriptionCopy {

  @Id
  private Long prescriptionId;

  private Long patientId;
  private Long doctorId;
  private LocalDate validUntil;

  @Lob
  private String notes;

  @Column(columnDefinition = "TEXT")
  private String itemsJson;

  private boolean processed = false;
  private LocalDateTime receivedAt = LocalDateTime.now();
}