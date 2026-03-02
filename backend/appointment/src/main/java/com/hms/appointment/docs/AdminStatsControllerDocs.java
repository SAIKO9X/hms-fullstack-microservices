package com.hms.appointment.docs;

import com.hms.appointment.dto.response.AppointmentDetailResponse;
import com.hms.appointment.dto.response.DailyActivityDto;
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
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Estatísticas Administrativas", description = "Endpoints para consulta de estatísticas e relatórios de consultas (Requer ADMIN)")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AdminStatsControllerDocs {

  @Operation(summary = "Total de consultas hoje", description = "Retorna o número total de consultas agendadas para o dia atual.")
  @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso")
  ResponseEntity<ResponseWrapper<Long>> getAppointmentsTodayCount();

  @Operation(summary = "Atividade diária", description = "Retorna as estatísticas de atividade diária das consultas.")
  @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso")
  ResponseEntity<ResponseWrapper<List<DailyActivityDto>>> getDailyActivity();

  @Operation(summary = "Médicos ativos", description = "Retorna os IDs dos médicos com consultas na última hora (Requer ADMIN ou DOCTOR).")
  @ApiResponse(responseCode = "200", description = "Lista de IDs retornada com sucesso")
  ResponseEntity<ResponseWrapper<List<Long>>> getActiveDoctorIds();

  @Operation(summary = "Consultas por médico", description = "Retorna os detalhes das consultas de um médico específico, com filtro opcional por data.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Consultas retornadas com sucesso"),
    @ApiResponse(responseCode = "404", description = "Médico não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<AppointmentDetailResponse>>> getAppointmentDetailsForDoctorById(
    @Parameter(description = "ID do médico") @PathVariable Long doctorId,
    @Parameter(description = "Filtro de data no formato yyyy-MM-dd (opcional)") @RequestParam(required = false) String dateFilter
  );
}
