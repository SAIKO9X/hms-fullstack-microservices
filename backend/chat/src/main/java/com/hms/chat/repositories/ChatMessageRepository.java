package com.hms.chat.repositories;

import com.hms.chat.entities.ChatMessage;
import com.hms.chat.enums.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

  List<ChatMessage> findByChatId(String chatId);

  long countByRecipientIdAndStatus(Long recipientId, MessageStatus status);

  // Atualizar status para LIDO
  @Modifying
  @Query("UPDATE ChatMessage m SET m.status = :status WHERE m.chatId = :chatId")
  void updateStatus(@Param("chatId") String chatId, @Param("status") MessageStatus status);
}