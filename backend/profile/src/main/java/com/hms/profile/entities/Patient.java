package com.hms.profile.entities;

import com.hms.profile.enums.BloodGroup;
import com.hms.profile.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tb_patients")
public class Patient {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private Long userId;

  @Column(unique = true, nullable = false, length = 14)
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

  @Column(columnDefinition = "TEXT")
  private String familyHistory;

  @Column(columnDefinition = "TEXT")
  private String chronicConditions;

  @ElementCollection
  @CollectionTable(name = "patient_allergies", joinColumns = @JoinColumn(name = "patient_id"))
  @Column(name = "allergy")
  private Set<String> allergies = new HashSet<>();

  private String profilePictureUrl;
}