package com.hms.audit.docs;

import com.hms.audit.entities.AuditLog;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Auditoria", description = "Endpoints para consulta de logs de rastreamento e eventos do sistema")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
  @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AuditControllerDocs {

  @Operation(
    summary = "Listar Logs de Auditoria",
    description = "Retorna uma lista paginada com os logs de auditoria de todo o sistema. Os resultados vêm ordenados pela data mais recente (descending)."
  )
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Logs de auditoria recuperados com sucesso")
  })
  ResponseEntity<ResponseWrapper<PagedResponse<AuditLog>>> getAllLogs(
    @Parameter(description = "Número da página (iniciando em 0)") @RequestParam(defaultValue = "0") int page,
    @Parameter(description = "Quantidade de registros por página") @RequestParam(defaultValue = "20") int size
  );
}