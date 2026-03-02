package com.hms.appointment.docs;

import com.hms.appointment.dto.request.HealthMetricCreateRequest;
import com.hms.appointment.dto.response.HealthMetricResponse;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Métricas de Saúde", description = "Endpoints para gerenciamento de métricas de saúde do paciente (Requer PATIENT)")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface HealthMetricControllerDocs {

  @Operation(summary = "Registrar métrica de saúde", description = "Cria um novo registro de métrica de saúde para o paciente autenticado.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Métrica registrada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content)
  })
  ResponseEntity<ResponseWrapper<HealthMetricResponse>> addHealthMetric(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody HealthMetricCreateRequest request
  );

  @Operation(summary = "Obter última métrica", description = "Retorna o registro mais recente de métrica de saúde do paciente autenticado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Métrica retornada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Nenhuma métrica encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<HealthMetricResponse>> getLatestMetric(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Histórico de métricas", description = "Retorna o histórico paginado de métricas de saúde do paciente autenticado.")
  @ApiResponse(responseCode = "200", description = "Histórico retornado com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<HealthMetricResponse>>> getHealthMetricHistory(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(hidden = true) Pageable pageable
  );
}
