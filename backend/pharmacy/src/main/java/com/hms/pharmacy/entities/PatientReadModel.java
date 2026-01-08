package com.hms.pharmacy.entities;

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
  private Long userId; // userId como chave primária para facilitar a busca

  private String name;
  private String email;
  private String phoneNumber;
  private String cpf;
}