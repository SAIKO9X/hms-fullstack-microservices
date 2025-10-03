package com.hms.appointment.entities;

import com.hms.appointment.utility.StringListConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "tb_appointment_records")
public class AppointmentRecord {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id", unique = true, nullable = false)
  private Appointment appointment;

  @Convert(converter = StringListConverter.class)
  private List<String> symptoms;

  private String diagnosis;

  @Convert(converter = StringListConverter.class)
  private List<String> tests;

  @Lob
  private String notes;

  @Convert(converter = StringListConverter.class)
  private List<String> prescription;

  @CreationTimestamp
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;
}