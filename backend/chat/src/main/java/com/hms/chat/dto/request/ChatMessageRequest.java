package com.hms.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatMessageRequest(
  @NotNull(message = "O ID do remetente é obrigatório.")
  Long senderId,

  @NotNull(message = "O ID do destinatário é obrigatório.")
  Long recipientId,

  @NotBlank(message = "O conteúdo da mensagem não pode estar vazio.")
  String content
) {
}