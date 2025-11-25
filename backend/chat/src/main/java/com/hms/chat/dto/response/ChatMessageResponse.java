package com.hms.chat.dto.response;

import com.hms.chat.entities.ChatMessage;
import com.hms.chat.enums.MessageStatus;

import java.util.Date;

public record ChatMessageResponse(
  Long id,
  String chatId,
  Long senderId,
  Long recipientId,
  String content,
  Date timestamp,
  MessageStatus status
) {
  // Entidade -> DTO
  public static ChatMessageResponse fromEntity(ChatMessage message) {
    return new ChatMessageResponse(
      message.getId(),
      message.getChatId(),
      message.getSenderId(),
      message.getRecipientId(),
      message.getContent(),
      message.getTimestamp(),
      message.getStatus()
    );
  }
}