package com.hms.appointment.entities;

import com.hms.appointment.enums.LabOrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tb_lab_orders")
public class LabOrder {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true)
  private String orderNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id")
  private Appointment appointment;

  private Long patientId;

  private LocalDateTime orderDate;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "lab_order_id")
  private List<LabTestItem> labTestItems = new ArrayList<>();

  private String notes;

  @Enumerated(EnumType.STRING)
  private LabOrderStatus status;
}