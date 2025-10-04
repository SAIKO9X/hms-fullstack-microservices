package com.hms.profile.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tb_doctors")
public class Doctor {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private Long userId;

  private String name;

  private LocalDate dateOfBirth;

  @Column(unique = true, nullable = false)
  private String crmNumber;

  private String specialization;

  private String department;

  private String phoneNumber;

  private int yearsOfExperience;

  @Lob
  private String qualifications;

  @Lob
  private String biography;

  private String profilePictureUrl;
}