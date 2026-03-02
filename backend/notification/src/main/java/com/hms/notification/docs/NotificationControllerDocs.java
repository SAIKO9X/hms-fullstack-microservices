package com.hms.notification.docs;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.notification.dto.response.NotificationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "Notificações", description = "Endpoints para gerenciamento e visualização de notificações")
@ApiResponses({
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface NotificationControllerDocs {

  @Operation(summary = "Listar Notificações do Usuário", description = "Retorna uma lista contendo todas as notificações associadas a um ID de usuário específico.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Notificações recuperadas com sucesso")
  })
  ResponseEntity<ResponseWrapper<List<NotificationResponse>>> getUserNotifications(
    @Parameter(description = "ID do usuário", required = true) @PathVariable String userId
  );

  @Operation(summary = "Marcar Notificação como Lida", description = "Atualiza o status de uma notificação específica para lida.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Notificação marcada como lida com sucesso"),
    @ApiResponse(responseCode = "404", description = "Notificação não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> markAsRead(
    @Parameter(description = "ID da notificação", required = true) @PathVariable Long id
  );

  @Operation(summary = "Marcar Todas como Lidas", description = "Atualiza o status de todas as notificações pendentes de um usuário para lidas.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Todas as notificações marcadas como lidas")
  })
  ResponseEntity<ResponseWrapper<Void>> markAllAsRead(
    @Parameter(description = "ID do usuário", required = true) @PathVariable String userId
  );
}