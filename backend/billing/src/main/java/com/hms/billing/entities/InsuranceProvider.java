package com.hms.billing.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_insurance_providers")
public class InsuranceProvider {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name; // Ex: Unimed, Bradesco

  @Column(name = "coverage_percentage")
  private BigDecimal coveragePercentage; // Ex: 0.80 (80%)

  private boolean active;
}