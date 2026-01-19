package com.hms.billing.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_patient_insurances")
public class PatientInsurance {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String patientId; // vindo do Profile Service

  private String policyNumber; // Número da carteirinha

  private LocalDate validUntil;

  @ManyToOne
  @JoinColumn(name = "provider_id")
  private InsuranceProvider provider;
}