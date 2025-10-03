package com.hms.profile.entities;

import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
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
@Table(name = "tb_patients")
public class Patient {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private Long userId;

  @Column(unique = true, nullable = false)
  private String cpf;

  private LocalDate dateOfBirth;

  private String phoneNumber;

  private String name;

  @Enumerated(EnumType.STRING)
  private BloodGroup bloodGroup;

  @Enumerated(EnumType.STRING)
  private Gender gender;

  private String address;

  private String emergencyContactName;

  private String emergencyContactPhone;

  private String chronicDiseases;

  @Lob
  private String allergies;
}