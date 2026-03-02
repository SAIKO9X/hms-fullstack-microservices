package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AppointmentRecordCreateRequest;
import com.hms.appointment.dto.request.AppointmentRecordUpdateRequest;
import com.hms.appointment.dto.response.AppointmentRecordResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Prontuários", description = "Endpoints para gerenciamento de prontuários de consultas médicas")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AppointmentRecordControllerDocs {

  @Operation(summary = "Criar prontuário", description = "Cria um novo prontuário vinculado a uma consulta (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Prontuário criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content),
    @ApiResponse(responseCode = "409", description = "Prontuário já existe para esta consulta", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentRecordResponse>> createRecord(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody AppointmentRecordCreateRequest request
  );

  @Operation(summary = "Buscar prontuário por consulta", description = "Retorna o prontuário de uma consulta específica. Apenas o médico responsável ou o paciente podem visualizar.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Prontuário encontrado com sucesso"),
    @ApiResponse(responseCode = "403", description = "Sem permissão para visualizar este prontuário", content = @Content),
    @ApiResponse(responseCode = "404", description = "Prontuário ou consulta não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentRecordResponse>> getRecordByAppointmentId(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(description = "ID da consulta") @PathVariable Long appointmentId
  );

  @Operation(summary = "Atualizar prontuário", description = "Atualiza as informações de um prontuário existente (Requer DOCTOR responsável).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Prontuário atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "403", description = "Sem permissão para atualizar este prontuário", content = @Content),
    @ApiResponse(responseCode = "404", description = "Prontuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentRecordResponse>> updateRecord(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(description = "ID do prontuário") @PathVariable Long recordId,
    @Valid @RequestBody AppointmentRecordUpdateRequest request
  );
}
