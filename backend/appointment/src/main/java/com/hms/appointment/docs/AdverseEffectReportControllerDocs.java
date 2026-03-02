package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Efeitos Adversos", description = "Endpoints para registro e revisão de relatórios de efeitos adversos")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AdverseEffectReportControllerDocs {

  @Operation(summary = "Registrar efeito adverso", description = "Cria um novo relatório de efeito adverso associado ao paciente autenticado (Requer PATIENT).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Relatório criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AdverseEffectReportResponse>> createReport(
    @Valid @RequestBody AdverseEffectReportCreateRequest request,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Listar relatórios do médico", description = "Retorna de forma paginada os relatórios de efeitos adversos dos pacientes do médico autenticado (Requer DOCTOR).")
  @ApiResponse(responseCode = "200", description = "Página de relatórios retornada com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<AdverseEffectReportResponse>>> getMyReports(
    @Parameter(hidden = true) Pageable pageable,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Marcar relatório como revisado", description = "Atualiza o status de um relatório de efeito adverso para revisado pelo médico autenticado (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Relatório marcado como revisado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Relatório não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AdverseEffectReportResponse>> markReportAsReviewed(
    @Parameter(description = "ID do relatório") @PathVariable Long reportId,
    @Parameter(hidden = true) Authentication authentication
  );
}
