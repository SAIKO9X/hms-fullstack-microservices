package com.hms.profile.docs;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.profile.dto.response.MedicalHistoryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Histórico Médico", description = "Endpoints para consultar o histórico médico dos pacientes")
@SecurityRequirement(name = "bearerAuth")
public interface MedicalHistoryControllerDocs {

  @Operation(summary = "Obter histórico por ID do perfil", description = "Recupera o histórico médico pelo ID do perfil do paciente (Requer ROLE_PATIENT ou ROLE_DOCTOR).")
  @ApiResponse(responseCode = "200", description = "Histórico recuperado com sucesso")
  ResponseEntity<ResponseWrapper<MedicalHistoryResponse>> getMedicalHistory(
    @Parameter(description = "ID do perfil do paciente") @PathVariable Long patientProfileId
  );

  @Operation(summary = "Obter histórico por ID de usuário", description = "Recupera o histórico médico pelo ID do usuário associado ao paciente (Requer ROLE_PATIENT ou ROLE_DOCTOR).")
  @ApiResponse(responseCode = "200", description = "Histórico recuperado com sucesso")
  ResponseEntity<ResponseWrapper<MedicalHistoryResponse>> getMedicalHistoryByUserId(
    @Parameter(description = "ID do usuário") @PathVariable Long userId
  );

  @Operation(summary = "Obter histórico (Admin)", description = "Recupera o histórico médico pelo ID do perfil do paciente para auditoria/administração (Requer ROLE_ADMIN).")
  @ApiResponse(responseCode = "200", description = "Histórico recuperado com sucesso")
  ResponseEntity<ResponseWrapper<MedicalHistoryResponse>> getPatientMedicalHistoryByIdForAdmin(
    @Parameter(description = "ID do perfil do paciente") @PathVariable Long patientProfileId
  );
}