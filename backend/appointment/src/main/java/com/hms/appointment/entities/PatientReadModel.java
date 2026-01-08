package com.hms.appointment.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "patient_read_model")
public class PatientReadModel {
  @Id
  private Long patientId;

  private Long userId;
  private String fullName;
  private String phoneNumber;
  private String email;
}