package com.hms.chat.services;

import com.hms.chat.dto.request.ChatMessageRequest;
import com.hms.chat.dto.response.ChatMessageResponse;

import java.util.List;

public interface ChatService {

  ChatMessageResponse saveMessage(ChatMessageRequest request);

  List<ChatMessageResponse> findChatMessages(Long senderId, Long recipientId);

  // para uso interno ou admin
  List<ChatMessageResponse> findByChatId(String chatId);
}