package com.hms.appointment.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "doctor_read_model")
public class DoctorReadModel {

  @Id
  private Long doctorId;
  private Long userId;
  private String fullName;
  private String specialization;
  private String profilePicture;
}