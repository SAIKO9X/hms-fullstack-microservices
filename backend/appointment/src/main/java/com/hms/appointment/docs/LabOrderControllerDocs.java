package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AddLabResultRequest;
import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.dto.response.LabOrderDTO;
import com.hms.appointment.entities.LabOrder;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Pedidos de Exame", description = "Endpoints para gerenciamento de pedidos de exames laboratoriais")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface LabOrderControllerDocs {

  @Operation(summary = "Criar pedido de exame", description = "Cria um novo pedido de exame laboratorial vinculado a uma consulta (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Pedido de exame criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<LabOrder>> createLabOrder(
    @RequestBody LabOrderCreateRequest request
  );

  @Operation(summary = "Listar pedidos por consulta", description = "Retorna todos os pedidos de exame vinculados a uma consulta específica.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Lista de pedidos retornada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<LabOrder>>> getOrdersByAppointment(
    @Parameter(description = "ID da consulta") @PathVariable Long appointmentId
  );

  @Operation(summary = "Adicionar resultado ao item", description = "Registra o resultado de um item de exame específico (Requer LAB_TECHNICIAN, ADMIN ou DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Resultado adicionado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Pedido ou item de exame não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<LabOrderDTO>> addResultToItem(
    @Parameter(description = "ID do pedido de exame") @PathVariable Long orderId,
    @Parameter(description = "ID do item do pedido") @PathVariable Long itemId,
    @RequestBody AddLabResultRequest request
  );
}
