package com.hms.chat.services.impl;

import com.hms.chat.dto.event.ChatMessageEvent;
import com.hms.chat.dto.request.ChatMessageRequest;
import com.hms.chat.dto.response.ChatMessageResponse;
import com.hms.chat.entities.ChatMessage;
import com.hms.chat.enums.MessageStatus;
import com.hms.chat.repositories.ChatMessageRepository;
import com.hms.chat.services.ChatService;
import com.hms.common.dto.event.EventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

  private final ChatMessageRepository repository;
  private final RabbitTemplate rabbitTemplate;

  @Value("${application.rabbitmq.exchange:hms.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.routing-keys.chat:notification.chat}")
  private String chatRoutingKey;

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

    // Agora request.senderName() funcionará pois atualizamos o DTO
    publishChatEvent(savedMessage, request.senderName());

    return ChatMessageResponse.fromEntity(savedMessage);
  }

  private void publishChatEvent(ChatMessage message, String senderName) {
    try {
      ChatMessageEvent event = new ChatMessageEvent(
        message.getRecipientId(),
        message.getSenderId(),
        senderName != null ? senderName : "Usuário",
        message.getContent(),
        message.getTimestamp().toString()
      );

      EventEnvelope<ChatMessageEvent> envelope = EventEnvelope.create(
        "CHAT_MESSAGE_SENT",
        message.getChatId(),
        event
      );

      rabbitTemplate.convertAndSend(exchange, chatRoutingKey, envelope);
    } catch (Exception e) {
      log.error("Falha ao enviar notificação de chat: {}", e.getMessage());
    }
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