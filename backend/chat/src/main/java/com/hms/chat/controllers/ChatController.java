package com.hms.chat.controllers;

import com.hms.chat.dto.request.ChatMessageRequest;
import com.hms.chat.dto.response.ChatMessageResponse;
import com.hms.chat.services.ChatService;
import com.hms.common.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

  private final SimpMessagingTemplate messagingTemplate;
  private final ChatService chatService;

  @MessageMapping("/chat.sendMessage")
  public void processMessage(@Payload ChatMessageRequest request) {
    ChatMessageResponse savedMsg = chatService.saveMessage(request);

    // envia para o destinatário
    messagingTemplate.convertAndSendToUser(
      String.valueOf(request.recipientId()),
      "/queue/messages",
      savedMsg
    );

    // envia cópia para o remetente (para atualizar UI se necessário)
    messagingTemplate.convertAndSendToUser(
      String.valueOf(request.senderId()),
      "/queue/messages",
      savedMsg
    );
  }

  @ResponseBody
  @GetMapping("/chat/messages/{senderId}/{recipientId}")
  public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> findChatMessages(@PathVariable Long senderId, @PathVariable Long recipientId) {
    return ResponseEntity.ok(ApiResponse.success(chatService.findChatMessages(senderId, recipientId)));
  }
}