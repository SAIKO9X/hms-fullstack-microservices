package com.hms.appointment.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "tb_medicines")
public class Medicine {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;
  private String dosage; // Ex: "500mg"
  private String frequency; // Ex: "A cada 8 horas"
  private Integer duration; // Ex: 7 (dias)

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "prescription_id", nullable = false)
  @JsonIgnore // Evita serialização infinita
  private Prescription prescription;
}