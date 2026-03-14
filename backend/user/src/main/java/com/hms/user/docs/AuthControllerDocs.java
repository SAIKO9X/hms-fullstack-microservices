package com.hms.user.docs;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.user.dto.request.ForgotPasswordRequest;
import com.hms.user.dto.request.LoginRequest;
import com.hms.user.dto.request.RefreshTokenRequest;
import com.hms.user.dto.request.ResetPasswordRequest;
import com.hms.user.dto.response.AuthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Autenticação", description = "Endpoints para gerenciamento de login, tokens e senhas")
@ApiResponses({
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface AuthControllerDocs {

  @Operation(summary = "Realizar Login", description = "Autentica o usuário utilizando email e senha e retorna o token de acesso.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content),
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas ou conta não ativada", content = @Content(schema = @Schema(implementation = ResponseWrapper.class)))
  })
  ResponseEntity<ResponseWrapper<AuthResponse>> login(
    @Parameter(description = "Credenciais do usuário", required = true)
    @Valid @RequestBody LoginRequest request
  );

  @Operation(summary = "Verificar Conta", description = "Ativa a conta do usuário utilizando o código de verificação enviado por email.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Conta verificada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Código inválido ou expirado", content = @Content),
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> verifyAccount(
    @Parameter(description = "Email do usuário", required = true) @RequestParam String email,
    @Parameter(description = "Código de verificação", required = true) @RequestParam String code
  );

  @Operation(summary = "Reenviar Código", description = "Reenvia um novo código de verificação para o email do usuário.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Código reenviado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Email não fornecido ou inválido", content = @Content),
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> resendCode(
    @Parameter(description = "Email do usuário", required = true) @RequestParam String email
  );

  @Operation(summary = "Atualizar Token", description = "Gera um novo par de Access e Refresh tokens utilizando um Refresh Token válido.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Tokens atualizados com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "401", description = "Refresh token inválido, expirado ou revogado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AuthResponse>> refreshToken(
    @Parameter(description = "Refresh token atual", required = true)
    @Valid @RequestBody RefreshTokenRequest request
  );

  @Operation(summary = "Solicitar recuperação de senha", description = "Envia um e-mail com o link de recuperação caso a conta exista.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Solicitação processada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Email inválido ou não fornecido", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> forgotPassword(
    @Parameter(description = "Email do usuário para envio do link", required = true)
    @Valid @RequestBody ForgotPasswordRequest request
  );

  @Operation(summary = "Redefinir senha", description = "Define uma nova senha utilizando um token de recuperação válido.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos (senha fraca, token ausente ou expirado)", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> resetPassword(
    @Parameter(description = "Token de recuperação e nova senha", required = true)
    @Valid @RequestBody ResetPasswordRequest request
  );
}