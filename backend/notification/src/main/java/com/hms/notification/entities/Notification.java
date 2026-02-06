package com.hms.notification.entities;

import com.hms.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String recipientId;

  private String title;

  @Column(length = 500)
  private String message;

  @Enumerated(EnumType.STRING)
  private NotificationType type;

  @Column(name = "is_read")
  private boolean read;

  private LocalDateTime createdAt;

  @PrePersist
  public void prePersist() {
    this.createdAt = LocalDateTime.now();
    this.read = false;
  }
}