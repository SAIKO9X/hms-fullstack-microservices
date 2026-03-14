package com.hms.profile.docs;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.profile.dto.request.AdminDoctorUpdateRequest;
import com.hms.profile.dto.request.DoctorCreateRequest;
import com.hms.profile.dto.request.DoctorUpdateRequest;
import com.hms.profile.dto.request.ProfilePictureUpdateRequest;
import com.hms.profile.dto.response.DoctorDropdownResponse;
import com.hms.profile.dto.response.DoctorResponse;
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

@Tag(name = "Médicos", description = "Endpoints para gerenciamento de perfis de médicos")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
})
public interface DoctorControllerDocs {

  @Operation(summary = "Criar perfil médico", description = "Cria um novo perfil de médico para o usuário logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Perfil criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "409", description = "O usuário já possui um perfil de médico", content = @Content)
  })
  ResponseEntity<ResponseWrapper<DoctorResponse>> createDoctorProfile(@Valid @RequestBody DoctorCreateRequest request);

  @Operation(summary = "Obter meu perfil", description = "Recupera o perfil médico do usuário logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil recuperado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Perfil não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<DoctorResponse>> getMyProfile(@Parameter(hidden = true) Authentication authentication);

  @Operation(summary = "Atualizar meu perfil", description = "Atualiza os dados do perfil médico do usuário logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Perfil não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<DoctorResponse>> updateMyProfile(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody DoctorUpdateRequest request
  );

  @Operation(summary = "Verificar existência de perfil", description = "Verifica se existe um perfil médico associado a um ID de usuário.")
  @ApiResponse(responseCode = "200", description = "Verificação concluída")
  ResponseEntity<ResponseWrapper<Boolean>> doctorProfileExists(@Parameter(description = "ID do usuário") @PathVariable Long userId);

  @Operation(summary = "Obter perfil por ID de usuário", description = "Recupera o perfil de um médico pelo ID da conta de usuário.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
    @ApiResponse(responseCode = "404", description = "Perfil não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<DoctorResponse>> getProfileByUserId(@Parameter(description = "ID do usuário") @PathVariable Long userId);

  @Operation(summary = "Obter lista de médicos (Dropdown)", description = "Retorna uma lista resumida de médicos para select/combobox.")
  @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso")
  ResponseEntity<ResponseWrapper<List<DoctorDropdownResponse>>> getDoctorsForDropdown();

  @Operation(summary = "Listar todos os médicos", description = "Retorna uma lista paginada de todos os perfis de médicos.")
  @ApiResponse(responseCode = "200", description = "Página de médicos recuperada")
  ResponseEntity<ResponseWrapper<PagedResponse<DoctorResponse>>> getAllDoctorProfiles(@Parameter(hidden = true) Pageable pageable);

  @Operation(summary = "Obter perfil por ID", description = "Recupera os detalhes de um perfil médico específico.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
    @ApiResponse(responseCode = "404", description = "Perfil não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<DoctorResponse>> getDoctorProfileById(@Parameter(description = "ID do perfil do médico") @PathVariable Long id);

  @Operation(summary = "Atualizar foto de perfil", description = "Atualiza a URL da foto de perfil do médico logado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Foto atualizada com sucesso"),
    @ApiResponse(responseCode = "400", description = "URL da imagem inválida", content = @Content),
    @ApiResponse(responseCode = "404", description = "Perfil não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> updateDoctorProfilePicture(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody ProfilePictureUpdateRequest request
  );

  @Operation(summary = "Atualizar perfil (Admin)", description = "Atualiza os dados de qualquer médico (Requer privilégios de ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Perfil não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> adminUpdateDoctor(
    @Parameter(description = "ID do usuário (médico)") @PathVariable("userId") Long userId,
    @RequestBody AdminDoctorUpdateRequest updateRequest
  );

  @Operation(summary = "Verificar existência de CRM", description = "Verifica se já existe um médico cadastrado com o CRM informado.")
  @ApiResponse(responseCode = "200", description = "Verificação concluída")
  ResponseEntity<ResponseWrapper<Boolean>> checkCrmExists(@Parameter(description = "CRM do médico") @PathVariable String crm);
}