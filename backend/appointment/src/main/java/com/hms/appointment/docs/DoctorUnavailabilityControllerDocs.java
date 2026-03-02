package com.hms.appointment.docs;

import com.hms.appointment.dto.request.DoctorUnavailabilityRequest;
import com.hms.appointment.dto.response.DoctorUnavailabilityResponse;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Indisponibilidade de Médicos", description = "Endpoints para gerenciamento de períodos de indisponibilidade dos médicos")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface DoctorUnavailabilityControllerDocs {

  @Operation(summary = "Registrar indisponibilidade", description = "Cria um novo período de indisponibilidade para o médico autenticado (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Indisponibilidade registrada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "409", description = "Conflito com período de indisponibilidade existente", content = @Content)
  })
  ResponseEntity<ResponseWrapper<DoctorUnavailabilityResponse>> create(
    @Valid @RequestBody DoctorUnavailabilityRequest request
  );

  @Operation(summary = "Listar indisponibilidades do médico", description = "Retorna todos os períodos de indisponibilidade de um médico específico.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Lista de indisponibilidades retornada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Médico não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<DoctorUnavailabilityResponse>>> listByDoctor(
    @Parameter(description = "ID do médico") @PathVariable Long doctorId
  );

  @Operation(summary = "Remover indisponibilidade", description = "Remove um período de indisponibilidade cadastrado (Requer DOCTOR ou ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Indisponibilidade removida com sucesso"),
    @ApiResponse(responseCode = "404", description = "Indisponibilidade não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> delete(
    @Parameter(description = "ID da indisponibilidade") @PathVariable Long id
  );
}
