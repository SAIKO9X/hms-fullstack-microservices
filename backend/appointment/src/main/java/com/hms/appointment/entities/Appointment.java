package com.hms.appointment.entities;

import com.hms.appointment.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tb_appointments")
public class Appointment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long patientId;

  @Column(nullable = false)
  private Long doctorId;

  @Column(nullable = false)
  private LocalDateTime appointmentDateTime;

  @Column(nullable = false)
  private Integer duration;

  @Column(nullable = false)
  private LocalDateTime appointmentEndTime;

  @Lob
  private String reason;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AppointmentStatus status;

  private String notes;
}