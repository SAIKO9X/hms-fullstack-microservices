package com.hms.pharmacy.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "tb_pharmacy_sale_items")
public class PharmacySaleItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sale_id", nullable = false)
  @JsonIgnore
  private PharmacySale sale;

  @Column(nullable = false)
  private Long medicineId;

  @Column(nullable = false)
  private String medicineName;

  // Número do lote para rastreabilidade
  private String batchNo;

  @Column(nullable = false)
  private Integer quantity;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal unitPrice;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal totalPrice;
}