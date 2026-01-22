package com.hms.appointment.entities;

import com.hms.appointment.enums.PrescriptionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "tb_prescriptions")
public class Prescription {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id", unique = true, nullable = false)
  private Appointment appointment;

  @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  private List<Medicine> medicines = new ArrayList<>();

  @Lob
  private String notes;

  @CreationTimestamp
  private LocalDateTime createdAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PrescriptionStatus status = PrescriptionStatus.ISSUED;

  // Método auxiliar para sincronizar a relação bidirecional
  public void setMedicines(List<Medicine> medicines) {
    this.medicines.clear();
    if (medicines != null) {
      medicines.forEach(medicine -> medicine.setPrescription(this));
      this.medicines.addAll(medicines);
    }
  }
}