package com.hms.audit.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tb_audit_logs")
public class AuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String actorId;
  private String actorRole;
  private String action;
  private String resourceName;
  private String resourceId;

  @Column(length = 1000)
  private String details;

  private String ipAddress;

  private LocalDateTime timestamp;
}