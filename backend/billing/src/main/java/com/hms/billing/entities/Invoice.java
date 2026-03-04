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
  @UniqueConstraint(columnNames = "appointment_id")
})
public class Invoice {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "pharmacy_sale_id")
  private Long pharmacySaleId;

  private Long appointmentId;
  private String patientId;
  private String doctorId;

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal totalAmount;

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal insuranceCovered = BigDecimal.ZERO;    // Coberto pelo convênio (Ex: 160.00)

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal patientPayable;      // A pagar pelo paciente (Ex: 40.00)

  @Column(length = 50, nullable = false)
  @Enumerated(EnumType.STRING)
  private InvoiceStatus status;

  @CreationTimestamp
  private LocalDateTime issuedAt;

  private LocalDateTime paidAt;

  private LocalDateTime patientPaidAt;

  private LocalDateTime insurancePaidAt;
}