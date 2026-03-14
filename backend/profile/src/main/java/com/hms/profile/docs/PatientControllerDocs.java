package com.hms.profile.docs;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.profile.dto.request.AdminPatientUpdateRequest;
import com.hms.profile.dto.request.PatientCreateRequest;
import com.hms.profile.dto.request.PatientUpdateRequest;
import com.hms.profile.dto.request.ProfilePictureUpdateRequest;
import com.hms.profile.dto.response.PatientDropdownResponse;
import com.hms.profile.dto.response.PatientResponse;
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

import java.util.List;

@Tag(name = "Pacientes", description = "Endpoints para gerenciamento de perfis de pacientes")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface PatientControllerDocs {

  @Operation(summary = "Criar perfil de paciente", description = "Cria um novo perfil de paciente para o usuário logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Perfil criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "409", description = "O usuário já possui um perfil de paciente", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PatientResponse>> createPatientProfile(@Valid @RequestBody PatientCreateRequest request);

  @Operation(summary = "Obter meu perfil", description = "Recupera o perfil de paciente do usuário logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil recuperado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Perfil de paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PatientResponse>> getMyProfile(@Parameter(hidden = true) Authentication authentication);

  @Operation(summary = "Atualizar meu perfil", description = "Atualiza os dados do perfil de paciente do usuário logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Perfil de paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PatientResponse>> updateMyProfile(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody PatientUpdateRequest request
  );

  @Operation(summary = "Verificar existência de perfil", description = "Verifica se existe um perfil de paciente associado a um ID de usuário.")
  @ApiResponse(responseCode = "200", description = "Verificação concluída")
  ResponseEntity<ResponseWrapper<Boolean>> patientProfileExists(@Parameter(description = "ID do usuário") @PathVariable Long userId);

  @Operation(summary = "Obter perfil por ID de usuário", description = "Recupera o perfil de um paciente utilizando o ID do usuário base.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
    @ApiResponse(responseCode = "404", description = "Perfil de paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PatientResponse>> getProfileByUserId(@Parameter(description = "ID do usuário") @PathVariable Long userId);

  @Operation(summary = "Obter lista de pacientes (Dropdown)", description = "Retorna uma lista resumida de pacientes para selects e filtros.")
  @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso")
  ResponseEntity<ResponseWrapper<List<PatientDropdownResponse>>> getPatientsForDropdown();

  @Operation(summary = "Listar todos os pacientes", description = "Retorna uma lista paginada de todos os pacientes (Requer privilégios de ADMIN).")
  @ApiResponse(responseCode = "200", description = "Página de pacientes recuperada")
  ResponseEntity<ResponseWrapper<PagedResponse<PatientResponse>>> getAllPatientProfiles(@Parameter(hidden = true) Pageable pageable);

  @Operation(summary = "Obter perfil por ID", description = "Recupera os detalhes de um perfil de paciente pelo seu ID (Requer ADMIN ou DOCTOR).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
    @ApiResponse(responseCode = "404", description = "Perfil de paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PatientResponse>> getPatientProfileById(@Parameter(description = "ID do perfil do paciente") @PathVariable Long id);

  @Operation(summary = "Atualizar foto de perfil", description = "Atualiza a URL da foto de perfil do paciente logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Foto atualizada com sucesso"),
    @ApiResponse(responseCode = "400", description = "URL da imagem inválida", content = @Content),
    @ApiResponse(responseCode = "404", description = "Perfil de paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> updatePatientProfilePicture(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody ProfilePictureUpdateRequest request
  );

  @Operation(summary = "Atualizar perfil (Admin)", description = "Atualiza os dados de qualquer paciente (Requer privilégios de ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Perfil de paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> adminUpdatePatient(
    @Parameter(description = "ID do usuário (paciente)") @PathVariable("userId") Long userId,
    @RequestBody AdminPatientUpdateRequest updateRequest
  );

  @Operation(summary = "Verificar existência de CPF", description = "Verifica se já existe um paciente cadastrado com o CPF informado.")
  @ApiResponse(responseCode = "200", description = "Verificação concluída")
  ResponseEntity<ResponseWrapper<Boolean>> checkCpfExists(@Parameter(description = "CPF do paciente") @PathVariable String cpf);
}