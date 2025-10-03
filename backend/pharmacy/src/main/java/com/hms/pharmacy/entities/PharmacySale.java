package com.hms.pharmacy.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "tb_pharmacy_sales")
public class PharmacySale {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column
  private Long originalPrescriptionId;

  @Column(nullable = false)
  private Long patientId;

  @Column(nullable = false)
  private String buyerName;

  private String buyerContact;

  // Data e hora em que a venda foi realizada
  @CreationTimestamp
  private LocalDateTime saleDate;

  // Valor total da venda
  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal totalAmount;

  // Lista dos itens vendidos nesta transação
  @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  private List<PharmacySaleItem> items = new ArrayList<>();
}
