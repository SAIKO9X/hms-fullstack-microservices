package com.hms.pharmacy.docs;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.pharmacy.controllers.PharmacySaleController.ProcessPrescriptionRequest;
import com.hms.pharmacy.dto.request.DirectSaleRequest;
import com.hms.pharmacy.dto.request.PharmacySaleRequest;
import com.hms.pharmacy.dto.response.PharmacyFinancialStatsResponse;
import com.hms.pharmacy.dto.response.PharmacySaleResponse;
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

@Tag(name = "Vendas da Farmácia", description = "Endpoints para processamento e histórico de vendas de medicamentos")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface PharmacySaleControllerDocs {

  @Operation(summary = "Criar venda padrão", description = "Registra uma nova venda na farmácia (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Venda registrada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "404", description = "Paciente ou medicamento não encontrado", content = @Content),
    @ApiResponse(responseCode = "422", description = "Estoque insuficiente para concluir a venda", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PharmacySaleResponse>> createSale(@Valid @RequestBody PharmacySaleRequest request);

  @Operation(summary = "Criar venda direta", description = "Registra uma venda direta de balcão (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Venda direta registrada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
    @ApiResponse(responseCode = "422", description = "Estoque insuficiente para concluir a venda", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PharmacySaleResponse>> createDirectSale(@Valid @RequestBody DirectSaleRequest request);

  @Operation(summary = "Criar venda via Receita", description = "Processa uma receita médica e debita os medicamentos do estoque criando uma venda (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Venda criada a partir da receita"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou receita já processada", content = @Content),
    @ApiResponse(responseCode = "404", description = "Receita não encontrada", content = @Content),
    @ApiResponse(responseCode = "422", description = "Estoque insuficiente para os itens da receita", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PharmacySaleResponse>> createSaleFromPrescription(@RequestBody ProcessPrescriptionRequest request);

  @Operation(summary = "Obter venda por ID", description = "Busca os detalhes e itens de uma venda específica (Requer ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Venda encontrada"),
    @ApiResponse(responseCode = "404", description = "Registro de venda não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PharmacySaleResponse>> getSaleById(@Parameter(description = "ID da venda") @PathVariable Long id);

  @Operation(summary = "Listar compras do paciente", description = "Retorna o histórico de compras de um paciente (Requer ser o próprio paciente ou ADMIN).")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Histórico recuperado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Paciente não encontrado", content = @Content)
  })
  ResponseEntity<ResponseWrapper<List<PharmacySaleResponse>>> getSalesByPatient(
    @Parameter(description = "ID do paciente") @PathVariable Long patientId,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Listar todas as vendas", description = "Retorna o histórico paginado de todas as vendas da farmácia (Requer ADMIN).")
  @ApiResponse(responseCode = "200", description = "Página de vendas recuperada")
  ResponseEntity<ResponseWrapper<PagedResponse<PharmacySaleResponse>>> getAllSales(@Parameter(hidden = true) Pageable pageable);

  @Operation(summary = "Estatísticas financeiras", description = "Obtém o resumo financeiro dos últimos 30 dias de vendas (Requer ADMIN).")
  @ApiResponse(responseCode = "200", description = "Estatísticas recuperadas")
  ResponseEntity<ResponseWrapper<PharmacyFinancialStatsResponse>> getFinancialStats();
}