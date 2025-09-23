package com.hms.pharmacy.entities;

import com.hms.pharmacy.enums.MedicineCategory;
import com.hms.pharmacy.enums.MedicineType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "tb_medicines")
public class Medicine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  private String dosage; // Ex: "500mg", "10ml"

  @Enumerated(EnumType.STRING)
  private MedicineCategory category;

  @Enumerated(EnumType.STRING)
  private MedicineType type;

  private String manufacturer;

  @Column(precision = 10, scale = 2)
  private BigDecimal unitPrice;

  private Integer totalStock = 0;

  @CreationTimestamp
  private LocalDateTime createdAt;
}