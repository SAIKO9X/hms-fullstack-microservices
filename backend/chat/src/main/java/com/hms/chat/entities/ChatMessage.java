package com.hms.chat.entities;

import com.hms.chat.enums.MessageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "tb_chat_messages")
public class ChatMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  // Identificador para buscar todo o histórico entre duas pessoas facilmente
  @Column(nullable = false)
  private String chatId;

  @Column(nullable = false)
  private Long senderId;

  @Column(nullable = false)
  private Long recipientId;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  @Temporal(TemporalType.TIMESTAMP)
  private Date timestamp;

  @Enumerated(EnumType.STRING)
  private MessageStatus status;
}