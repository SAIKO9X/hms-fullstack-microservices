package com.hms.user.docs;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.user.dto.request.AdminCreateUserRequest;
import com.hms.user.dto.request.AdminUpdateUserRequest;
import com.hms.user.dto.request.UserRequest;
import com.hms.user.dto.request.UserStatusUpdateRequest;
import com.hms.user.dto.response.UserResponse;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Usuários", description = "Endpoints para gerenciamento e cadastro de usuários")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface UserControllerDocs {

  @Operation(summary = "Registrar novo usuário", description = "Cria um novo usuário no sistema com perfil padrão.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos", content = @Content),
    @ApiResponse(responseCode = "409", description = "Email ou nome de usuário já em uso", content = @Content)
  })
  ResponseEntity<ResponseWrapper<UserResponse>> createUser(@Valid @RequestBody UserRequest request);

  @Operation(summary = "Buscar usuário por ID", description = "Recupera os detalhes de um usuário específico pelo seu identificador.", security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<UserResponse>> getUserById(
    @Parameter(description = "ID do usuário", required = true) @PathVariable Long id
  );

  @Operation(summary = "Atualizar usuário", description = "Atualiza os dados cadastrais do próprio usuário.", security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<UserResponse>> updateUser(
    @Parameter(description = "ID do usuário", required = true) @PathVariable Long id,
    @Valid @RequestBody UserRequest request
  );

  @Operation(summary = "Alterar status do usuário", description = "Ativa ou inativa um usuário (Requer privilégios de ADMIN).", security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Status atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Status inválido", content = @Content),
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> updateUserStatus(
    @Parameter(description = "ID do usuário", required = true) @PathVariable Long id,
    @Valid @RequestBody UserStatusUpdateRequest request
  );

  @Operation(summary = "Criar usuário (Admin)", description = "Cria um usuário podendo definir roles específicas (Requer privilégios de ADMIN).", security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "409", description = "Email ou nome de usuário já em uso", content = @Content)
  })
  ResponseEntity<ResponseWrapper<UserResponse>> adminCreateUser(@Valid @RequestBody AdminCreateUserRequest request);

  @Operation(summary = "Atualizar usuário (Admin)", description = "Atualiza qualquer usuário no sistema (Requer privilégios de ADMIN).", security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> adminUpdateUser(
    @Parameter(description = "ID do usuário", required = true) @PathVariable Long id,
    @Valid @RequestBody AdminUpdateUserRequest request
  );

  @Operation(summary = "Listar todos os usuários", description = "Retorna uma lista paginada de todos os usuários (Requer privilégios de ADMIN).", security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponse(responseCode = "200", description = "Página de usuários recuperada")
  ResponseEntity<ResponseWrapper<PagedResponse<UserResponse>>> getAllUsers(
    @Parameter(hidden = true) Pageable pageable
  );
}