package com.hms.profile.docs;

import com.hms.common.dto.response.ResponseWrapper;
import com.hms.profile.dto.request.ReviewCreateRequest;
import com.hms.profile.dto.request.ReviewUpdateRequest;
import com.hms.profile.dto.response.DoctorRatingDto;
import com.hms.profile.dto.response.ReviewResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Avaliações", description = "Endpoints para gerenciamento de avaliações de médicos")
@SecurityRequirement(name = "bearerAuth")
public interface ReviewControllerDocs {

  @Operation(summary = "Criar avaliação", description = "Cria uma nova avaliação (review/estrelas) para um médico.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Avaliação enviada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
  })
  ResponseEntity<ResponseWrapper<ReviewResponse>> createReview(
    @RequestBody @Valid ReviewCreateRequest request,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Obter estatísticas do médico", description = "Retorna a média de estrelas e contagem de avaliações de um médico.")
  @ApiResponse(responseCode = "200", description = "Estatísticas recuperadas com sucesso")
  ResponseEntity<ResponseWrapper<DoctorRatingDto>> getDoctorStats(@Parameter(description = "ID do médico") @PathVariable Long doctorId);

  @Operation(summary = "Listar avaliações do médico", description = "Retorna todas as avaliações feitas para um determinado médico.")
  @ApiResponse(responseCode = "200", description = "Avaliações recuperadas com sucesso")
  ResponseEntity<ResponseWrapper<List<ReviewResponse>>> getDoctorReviews(@Parameter(description = "ID do médico") @PathVariable Long doctorId);

  @Operation(summary = "Atualizar avaliação", description = "Atualiza uma avaliação que já foi enviada pelo paciente logado.")
  @ApiResponse(responseCode = "200", description = "Avaliação atualizada com sucesso")
  ResponseEntity<ResponseWrapper<ReviewResponse>> updateReview(
    @Parameter(description = "ID do médico avaliado") @PathVariable Long doctorId,
    @RequestBody @Valid ReviewUpdateRequest request,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Obter minha avaliação", description = "Verifica se o usuário logado já fez uma avaliação para um médico e a retorna se existir.")
  @ApiResponse(responseCode = "200", description = "Avaliação recuperada com sucesso")
  ResponseEntity<ResponseWrapper<ReviewResponse>> getMyReviewForDoctor(
    @Parameter(description = "ID do médico") @PathVariable Long doctorId,
    @Parameter(hidden = true) Authentication authentication
  );
}