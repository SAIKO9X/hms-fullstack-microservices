package com.hms.pharmacy.entities;

import com.hms.pharmacy.enums.StockStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "tb_medicine_inventory")
public class MedicineInventory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "medicine_id", nullable = false)
  private Medicine medicine;

  @Column(unique = true)
  private String batchNo;

  private Integer quantity;

  private Integer initialQuantity;

  @Enumerated(EnumType.STRING)
  private StockStatus status;

  private LocalDate expiryDate;

  private LocalDate addedDate;
}