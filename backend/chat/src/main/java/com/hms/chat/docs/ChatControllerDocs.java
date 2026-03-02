package com.hms.chat.docs;

import com.hms.chat.dto.request.ChatMessageRequest;
import com.hms.chat.dto.response.ChatMessageResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "Chat", description = "Endpoints para histórico de conversas e processamento de mensagens WebSocket")
@ApiResponses({
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface ChatControllerDocs {

  @Operation(
    summary = "Processar Mensagem (WebSocket)",
    description = "Processa e salva uma mensagem via WebSocket (STOMP). Rota do Broker: '/chat.sendMessage'."
  )
  void processMessage(
    @Parameter(description = "Payload contendo os dados da mensagem", required = true) @Payload ChatMessageRequest request
  );

  @Operation(summary = "Histórico de Mensagens", description = "Recupera o histórico completo de conversas entre dois usuários (remetente e destinatário).")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Histórico de mensagens recuperado com sucesso")
  })
  ResponseEntity<ResponseWrapper<List<ChatMessageResponse>>> findChatMessages(
    @Parameter(description = "ID do usuário remetente", required = true) @PathVariable Long senderId,
    @Parameter(description = "ID do usuário destinatário", required = true) @PathVariable Long recipientId
  );
}