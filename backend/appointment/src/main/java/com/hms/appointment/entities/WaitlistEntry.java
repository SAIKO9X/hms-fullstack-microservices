package com.hms.appointment.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "waitlist_entries")
@EntityListeners(AuditingEntityListener.class)
public class WaitlistEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long doctorId;

  @Column(nullable = false)
  private Long patientId;

  // nome/email para facilitar a notificação sem fazer muitos lookups
  private String patientName;
  private String patientEmail;

  @Column(nullable = false)
  private LocalDate date; // O dia que o paciente quer a consulta

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
}