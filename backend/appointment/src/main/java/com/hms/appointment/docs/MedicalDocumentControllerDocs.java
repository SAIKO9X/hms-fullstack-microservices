package com.hms.appointment.docs;

import com.hms.appointment.dto.request.MedicalDocumentCreateRequest;
import com.hms.appointment.dto.response.MedicalDocumentResponse;
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

@Tag(name = "Documentos Médicos", description = "Endpoints para gerenciamento de documentos médicos dos pacientes")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface MedicalDocumentControllerDocs {

  @Operation(summary = "Enviar documento", description = "Realiza o upload de um novo documento médico para o paciente autenticado.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Documento enviado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicalDocumentResponse>> uploadDocument(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody MedicalDocumentCreateRequest request
  );

  @Operation(summary = "Meus documentos", description = "Retorna os documentos médicos do paciente autenticado de forma paginada (Requer PATIENT).")
  @ApiResponse(responseCode = "200", description = "Lista de documentos retornada com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<MedicalDocumentResponse>>> getMyDocuments(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(hidden = true) Pageable pageable
  );

  @Operation(summary = "Documentos por paciente", description = "Retorna os documentos médicos de um paciente específico de forma paginada (Requer DOCTOR ou ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Lista de documentos retornada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PagedResponse<MedicalDocumentResponse>>> getDocumentsForPatient(
    @Parameter(description = "ID do paciente") @PathVariable Long patientId,
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(hidden = true) Pageable pageable
  );

  @Operation(summary = "Remover documento", description = "Remove um documento médico pelo ID (Requer ser o proprietário do documento).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Documento removido com sucesso"),
    @ApiResponse(responseCode = "404", description = "Documento não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> deleteDocument(
    @Parameter(description = "ID do documento") @PathVariable Long id,
    @Parameter(hidden = true) Authentication authentication
  );
}
