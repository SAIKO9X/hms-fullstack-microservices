package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AvailabilityRequest;
import com.hms.appointment.dto.response.AvailabilityResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Disponibilidade de Médicos", description = "Endpoints para consulta e gerenciamento de disponibilidade de horários dos médicos")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface DoctorAvailabilityControllerDocs {

  @Operation(summary = "Listar disponibilidades do médico", description = "Retorna todas as disponibilidades cadastradas de um médico específico (Requer DOCTOR, ADMIN ou PATIENT).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Disponibilidades retornadas com sucesso"),
    @ApiResponse(responseCode = "404", description = "Médico não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<AvailabilityResponse>>> getAvailability(
    @Parameter(description = "ID do médico") @PathVariable Long doctorId
  );

  @Operation(summary = "Adicionar disponibilidade", description = "Cadastra um novo horário de disponibilidade para um médico (Requer DOCTOR ou ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Disponibilidade adicionada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Médico não encontrado", content = @Content),
    @ApiResponse(responseCode = "409", description = "Conflito com disponibilidade existente", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AvailabilityResponse>> addAvailability(
    @Parameter(description = "ID do médico") @PathVariable Long doctorId,
    @RequestBody AvailabilityRequest request
  );

  @Operation(summary = "Remover disponibilidade", description = "Remove um horário de disponibilidade cadastrado (Requer DOCTOR ou ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Disponibilidade removida com sucesso"),
    @ApiResponse(responseCode = "404", description = "Disponibilidade não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> deleteAvailability(
    @Parameter(description = "ID da disponibilidade") @PathVariable Long id
  );

  @Operation(summary = "Consultar horários disponíveis", description = "Retorna os horários livres de um médico em uma data específica (Requer DOCTOR, ADMIN ou PATIENT).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Horários disponíveis retornados com sucesso"),
    @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Médico não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<String>>> getAvailableSlots(
    @Parameter(description = "ID do médico") @RequestParam Long doctorId,
    @Parameter(description = "Data no formato yyyy-MM-dd") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
    @Parameter(description = "Duração da consulta em minutos (padrão: 30)") @RequestParam(required = false, defaultValue = "30") Integer duration
  );
}
