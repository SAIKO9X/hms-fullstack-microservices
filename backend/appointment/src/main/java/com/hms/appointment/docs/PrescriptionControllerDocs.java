package com.hms.appointment.docs;

import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
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

@Tag(name = "Prescrições", description = "Endpoints para gerenciamento de prescrições médicas")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface PrescriptionControllerDocs {

  @Operation(summary = "Criar prescrição", description = "Cria uma nova prescrição médica vinculada a uma consulta (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Prescrição criada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Consulta não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PrescriptionResponse>> createPrescription(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody PrescriptionCreateRequest request
  );

  @Operation(summary = "Obter prescrição por ID", description = "Retorna os detalhes de uma prescrição pelo seu ID.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Prescrição encontrada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Prescrição não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PrescriptionResponse>> getPrescriptionById(
    @Parameter(description = "ID da prescrição") @PathVariable Long id,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Atualizar prescrição", description = "Atualiza os dados de uma prescrição existente (Requer DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Prescrição atualizada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Prescrição não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PrescriptionResponse>> updatePrescription(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(description = "ID da prescrição") @PathVariable Long id,
    @Valid @RequestBody PrescriptionUpdateRequest request
  );

  @Operation(summary = "Prescrição por consulta", description = "Retorna a prescrição vinculada a uma consulta específica.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Prescrição encontrada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Prescrição ou consulta não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PrescriptionResponse>> getPrescriptionByAppointmentId(
    @Parameter(description = "ID da consulta") @PathVariable Long appointmentId,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Prescrições por paciente", description = "Retorna o histórico paginado de prescrições de um paciente específico.")
  @ApiResponse(responseCode = "200", description = "Lista de prescrições retornada com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<PrescriptionResponse>>> getPrescriptionsByPatientId(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(description = "ID do paciente") @PathVariable Long patientId,
    @Parameter(hidden = true) Pageable pageable
  );

  @Operation(summary = "Meu histórico de prescrições", description = "Retorna o histórico paginado de prescrições do paciente autenticado (Requer PATIENT).")
  @ApiResponse(responseCode = "200", description = "Histórico de prescrições retornado com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<PrescriptionResponse>>> getMyPrescriptionHistory(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(hidden = true) Pageable pageable
  );

  @Operation(summary = "Prescrição para farmácia", description = "Retorna os dados de uma prescrição formatados para uso pela farmácia.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Dados da prescrição retornados com sucesso"),
    @ApiResponse(responseCode = "404", description = "Prescrição não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PrescriptionForPharmacyResponse>> getPrescriptionForPharmacy(
    @Parameter(description = "ID da prescrição") @PathVariable Long id
  );

  @Operation(summary = "Última prescrição do paciente", description = "Retorna a prescrição mais recente do paciente autenticado (Requer PATIENT).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Prescrição retornada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Nenhuma prescrição encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PrescriptionResponse>> getLatestPrescription(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Download PDF da prescrição", description = "Gera e baixa o PDF de uma prescrição (Requer DOCTOR, PATIENT ou ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Prescrição não encontrada", content = @Content)
  })
  ResponseEntity<byte[]> downloadPrescriptionPdf(
    @Parameter(description = "ID da prescrição") @PathVariable Long id,
    @Parameter(hidden = true) Authentication authentication
  );
}
