package com.hms.billing.entities;

import com.hms.billing.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
  name = "tb_invoices", uniqueConstraints = {
  @UniqueConstraint(columnNames = "appointmentId")
})
public class Invoice {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private Long appointmentId;
  private String patientId;
  private String doctorId;

  private BigDecimal totalAmount;         // Valor total da consulta (Ex: 200.00)
  private BigDecimal insuranceCovered;    // Coberto pelo convênio (Ex: 160.00)
  private BigDecimal patientPayable;      // A pagar pelo paciente (Ex: 40.00)

  @Enumerated(EnumType.STRING)
  private InvoiceStatus status;

  @CreationTimestamp
  private LocalDateTime issuedAt;

  private LocalDateTime paidAt;

  private LocalDateTime patientPaidAt;

  private LocalDateTime insurancePaidAt;
}