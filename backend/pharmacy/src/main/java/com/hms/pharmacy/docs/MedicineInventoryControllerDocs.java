package com.hms.pharmacy.docs;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.pharmacy.dto.request.MedicineInventoryRequest;
import com.hms.pharmacy.dto.response.MedicineInventoryResponse;
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

@Tag(name = "Estoque de Medicamentos", description = "Endpoints para controle de estoque e lotes na farmácia")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface MedicineInventoryControllerDocs {

  @Operation(summary = "Adicionar lote ao estoque", description = "Dá entrada em um novo lote de medicamentos no estoque (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Estoque adicionado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Medicamento base não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicineInventoryResponse>> addInventoryItem(@Valid @RequestBody MedicineInventoryRequest request);

  @Operation(summary = "Listar estoque", description = "Retorna uma lista paginada com todos os lotes de medicamentos em estoque.")
  @ApiResponse(responseCode = "200", description = "Página de estoque recuperada")
  ResponseEntity<ResponseWrapper<PagedResponse<MedicineInventoryResponse>>> getAllInventory(@Parameter(hidden = true) Pageable pageable);

  @Operation(summary = "Obter lote por ID", description = "Busca os detalhes de uma entrada de estoque (lote) específica.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Item de estoque encontrado"),
    @ApiResponse(responseCode = "404", description = "Lote não encontrado no estoque", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicineInventoryResponse>> getInventoryItemById(@Parameter(description = "ID do item de estoque") @PathVariable Long id);

  @Operation(summary = "Atualizar lote de estoque", description = "Atualiza os dados (quantidade, validade) de um lote (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Item de estoque atualizado"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Lote não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<MedicineInventoryResponse>> updateInventoryItem(
    @Parameter(description = "ID do item de estoque") @PathVariable Long id,
    @Valid @RequestBody MedicineInventoryRequest request
  );

  @Operation(summary = "Remover lote do estoque", description = "Exclui permanentemente uma entrada de estoque (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Item removido com sucesso"),
    @ApiResponse(responseCode = "404", description = "Lote não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> deleteInventoryItem(@Parameter(description = "ID do item de estoque") @PathVariable Long id);
}