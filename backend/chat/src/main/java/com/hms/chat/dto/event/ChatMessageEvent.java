package com.hms.chat.dto.event;

public record ChatMessageEvent(
  Long recipientId,
  Long senderId,
  String senderName,
  String content, // snippet da mensagem
  String timestamp
) {
}