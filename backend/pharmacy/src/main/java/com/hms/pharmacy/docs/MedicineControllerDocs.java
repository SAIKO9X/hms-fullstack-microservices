package com.hms.pharmacy.docs;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.pharmacy.dto.request.MedicineRequest;
import com.hms.pharmacy.dto.response.MedicineResponse;
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

@Tag(name = "Medicamentos", description = "Endpoints para gerenciamento do catálogo de medicamentos")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface MedicineControllerDocs {

  @Operation(summary = "Adicionar medicamento", description = "Cadastra um novo medicamento no catálogo (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Medicamento adicionado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "409", description = "Medicamento já cadastrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicineResponse>> addMedicine(@Valid @RequestBody MedicineRequest request);

  @Operation(summary = "Obter medicamento por ID", description = "Recupera os detalhes de um medicamento específico do catálogo.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Medicamento encontrado"),
    @ApiResponse(responseCode = "404", description = "Medicamento não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicineResponse>> getMedicineById(@Parameter(description = "ID do medicamento") @PathVariable Long id);

  @Operation(summary = "Listar todos os medicamentos", description = "Retorna uma lista paginada de todos os medicamentos cadastrados.")
  @ApiResponse(responseCode = "200", description = "Página de medicamentos recuperada com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<MedicineResponse>>> getAllMedicines(@Parameter(hidden = true) Pageable pageable);

  @Operation(summary = "Atualizar medicamento", description = "Atualiza os dados de um medicamento existente no catálogo (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Medicamento atualizado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Medicamento não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicineResponse>> updateMedicine(
    @Parameter(description = "ID do medicamento") @PathVariable Long id,
    @Valid @RequestBody MedicineRequest request
  );
}