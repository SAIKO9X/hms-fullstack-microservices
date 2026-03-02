package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AppointmentCompleteRequest;
import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.request.AppointmentUpdateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
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

import java.util.List;

@Tag(name = "Consultas", description = "Endpoints para gerenciamento de consultas médicas")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AppointmentControllerDocs {

  @Operation(summary = "Buscar consulta por ID", description = "Retorna os detalhes de uma consulta específica. Apenas o paciente, médico ou admin podem visualizar.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Consulta encontrada com sucesso"),
    @ApiResponse(responseCode = "403", description = "Sem permissão para visualizar esta consulta", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> getAppointmentById(
    @Parameter(description = "ID da consulta") @PathVariable Long id,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Cancelar consulta", description = "Cancela uma consulta agendada. Apenas o paciente ou médico responsável podem cancelar.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Consulta cancelada com sucesso"),
    @ApiResponse(responseCode = "403", description = "Sem permissão para cancelar esta consulta", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content),
    @ApiResponse(responseCode = "409", description = "Consulta não pode ser cancelada (estado inválido)", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> cancelAppointment(
    @Parameter(description = "ID da consulta") @PathVariable Long id,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Reagendar consulta", description = "Reagenda uma consulta para uma nova data e horário.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Consulta reagendada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "403", description = "Sem permissão para reagendar esta consulta", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content),
    @ApiResponse(responseCode = "409", description = "Horário indisponível para o médico", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> rescheduleAppointment(
    @Parameter(description = "ID da consulta") @PathVariable Long id,
    @Valid @RequestBody AppointmentUpdateRequest request,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Finalizar consulta", description = "Marca uma consulta como concluída com as observações do médico (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Consulta finalizada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "403", description = "Sem permissão para finalizar esta consulta", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content),
    @ApiResponse(responseCode = "409", description = "Consulta não pode ser finalizada (estado inválido)", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> completeAppointment(
    @Parameter(description = "ID da consulta") @PathVariable Long id,
    @Valid @RequestBody AppointmentCompleteRequest request,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Entrar na lista de espera", description = "Adiciona o paciente autenticado à lista de espera para uma consulta (Requer PATIENT).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Adicionado à lista de espera com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "409", description = "Paciente já está na lista de espera", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> joinWaitlist(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody AppointmentCreateRequest request
  );

  @Operation(summary = "Histórico de consultas do paciente", description = "Retorna todas as consultas de um paciente específico (Requer ADMIN ou DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<AppointmentResponse>>> getAppointmentHistory(
    @Parameter(description = "ID do paciente") @PathVariable Long patientId
  );
}
