package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AppointmentCompleteRequest;
import com.hms.appointment.dto.response.*;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Consultas do Médico", description = "Endpoints para gerenciamento de consultas pelo médico autenticado (Requer DOCTOR)")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface DoctorAppointmentControllerDocs {

  @Operation(summary = "Listar minhas consultas", description = "Retorna de forma paginada as consultas do médico autenticado.")
  @ApiResponse(responseCode = "200", description = "Página de consultas retornada com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<AppointmentResponse>>> getMyAppointments(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(hidden = true) Pageable pageable
  );

  @Operation(summary = "Detalhes das consultas", description = "Retorna os detalhes das consultas do médico autenticado com filtro opcional.")
  @ApiResponse(responseCode = "200", description = "Detalhes das consultas retornados com sucesso")
  ResponseEntity<ResponseWrapper<List<AppointmentDetailResponse>>> getAppointmentDetails(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(description = "Filtro de consultas (ex: 'today', 'all'). Padrão: 'all'") @RequestParam(required = false, defaultValue = "all") String filter
  );

  @Operation(summary = "Finalizar consulta", description = "Marca uma consulta como concluída com as observações do médico.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Consulta finalizada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content),
    @ApiResponse(responseCode = "409", description = "Consulta não pode ser finalizada (estado inválido)", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> completeAppointment(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(description = "ID da consulta") @PathVariable Long id,
    @RequestBody AppointmentCompleteRequest request
  );

  @Operation(summary = "Estatísticas do dashboard", description = "Retorna as estatísticas resumidas do dashboard do médico autenticado.")
  @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso")
  ResponseEntity<ResponseWrapper<DoctorDashboardStatsResponse>> getDoctorDashboardStats(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Contagem de pacientes únicos", description = "Retorna o total de pacientes únicos atendidos pelo médico autenticado.")
  @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso")
  ResponseEntity<ResponseWrapper<Long>> getUniquePatientsCount(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Grupos de pacientes", description = "Retorna os pacientes do médico autenticado agrupados por critério.")
  @ApiResponse(responseCode = "200", description = "Grupos de pacientes retornados com sucesso")
  ResponseEntity<ResponseWrapper<List<PatientGroupResponse>>> getPatientGroups(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Meus pacientes", description = "Retorna o resumo de todos os pacientes do médico autenticado.")
  @ApiResponse(responseCode = "200", description = "Lista de pacientes retornada com sucesso")
  ResponseEntity<ResponseWrapper<List<DoctorPatientSummaryDto>>> getMyPatients(
    @Parameter(hidden = true) Authentication authentication
  );
}
