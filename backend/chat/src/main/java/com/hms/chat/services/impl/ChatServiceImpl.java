package com.hms.chat.services.impl;

import com.hms.chat.dto.request.ChatMessageRequest;
import com.hms.chat.dto.response.ChatMessageResponse;
import com.hms.chat.entities.ChatMessage;
import com.hms.chat.enums.MessageStatus;
import com.hms.chat.repositories.ChatMessageRepository;
import com.hms.chat.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

  private final ChatMessageRepository repository;

  @Override
  @Transactional
  public ChatMessageResponse saveMessage(ChatMessageRequest request) {
    String chatId = generateChatId(request.senderId(), request.recipientId());

    ChatMessage message = ChatMessage.builder()
      .chatId(chatId)
      .senderId(request.senderId())
      .recipientId(request.recipientId())
      .content(request.content())
      .timestamp(new Date())
      .status(MessageStatus.SENT)
      .build();

    ChatMessage savedMessage = repository.save(message);
    return ChatMessageResponse.fromEntity(savedMessage);
  }

  @Override
  public List<ChatMessageResponse> findChatMessages(Long senderId, Long recipientId) {
    String chatId = generateChatId(senderId, recipientId);
    return findByChatId(chatId);
  }

  @Override
  public List<ChatMessageResponse> findByChatId(String chatId) {
    return repository.findByChatId(chatId)
      .stream()
      .map(ChatMessageResponse::fromEntity)
      .toList();
  }

  private String generateChatId(Long senderId, Long recipientId) {
    var minId = Math.min(senderId, recipientId);
    var maxId = Math.max(senderId, recipientId);
    return String.format("%d_%d", minId, maxId);
  }
}