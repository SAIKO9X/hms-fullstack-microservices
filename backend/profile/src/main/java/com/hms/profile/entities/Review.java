package com.hms.profile.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long doctorId;

  @Column(nullable = false)
  private Long patientId;

  // Garante que uma consulta só tem uma avaliação
  @Column(nullable = false, unique = true)
  private Long appointmentId;

  @Column(nullable = false)
  private Integer rating; // 1 a 5

  @Column(columnDefinition = "TEXT")
  private String comment;

  @CreationTimestamp
  private LocalDateTime createdAt;
}