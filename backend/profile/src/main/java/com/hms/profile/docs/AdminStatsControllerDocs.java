package com.hms.profile.docs;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.profile.dto.response.AdminDashboardStatsResponse;
import com.hms.profile.dto.response.DoctorStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "Estatísticas Admin", description = "Endpoints para o dashboard do administrador (Requer ADMIN)")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão ADMIN)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AdminStatsControllerDocs {

  @Operation(summary = "Obter contagens do dashboard", description = "Retorna o total de pacientes e médicos cadastrados no sistema.")
  @ApiResponse(responseCode = "200", description = "Estatísticas recuperadas com sucesso")
  ResponseEntity<ResponseWrapper<AdminDashboardStatsResponse>> getDashboardCounts();

  @Operation(summary = "Obter status dos médicos", description = "Retorna uma lista com o status atual de cada médico.")
  @ApiResponse(responseCode = "200", description = "Status dos médicos recuperados com sucesso")
  ResponseEntity<ResponseWrapper<List<DoctorStatusResponse>>> getDoctorsStatus();
}