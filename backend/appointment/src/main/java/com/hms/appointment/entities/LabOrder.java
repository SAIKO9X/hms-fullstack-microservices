package com.hms.appointment.entities;

import com.hms.appointment.enums.ReportStatus;
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

  private Long appointmentId;
  private Long patientId;
  private Long doctorId;

  private LocalDateTime orderDate;

  @ElementCollection
  @CollectionTable(name = "tb_lab_order_items", joinColumns = @JoinColumn(name = "lab_order_id"))
  private List<LabTestItem> tests = new ArrayList<>();

  private String notes; // Observações gerais do pedido

  @Enumerated(EnumType.STRING)
  private ReportStatus status; // PENDING, COMPLETED
}