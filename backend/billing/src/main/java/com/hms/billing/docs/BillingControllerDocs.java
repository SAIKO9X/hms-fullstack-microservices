package com.hms.billing.docs;

import com.hms.billing.controllers.BillingController.InsuranceRequest;
import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Faturamento e Seguros", description = "Endpoints para gerenciamento de faturas de consultas, pagamentos e dados de planos de saúde")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado", content = @Content),
  @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface BillingControllerDocs {

  @Operation(summary = "Listar Faturas do Paciente", description = "Retorna todas as faturas associadas a um paciente específico.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Faturas recuperadas com sucesso")
  })
  ResponseEntity<ResponseWrapper<List<Invoice>>> getPatientInvoices(
    @Parameter(description = "ID do paciente", required = true) @PathVariable String patientId,
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Listar Faturas do Médico", description = "Retorna todas as faturas geradas pelos serviços de um médico específico.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Faturas recuperadas com sucesso")
  })
  ResponseEntity<ResponseWrapper<List<Invoice>>> getDoctorInvoices(
    @Parameter(description = "ID do médico", required = true) @PathVariable String doctorId
  );

  @Operation(summary = "Registrar Plano de Saúde", description = "Adiciona ou atualiza as informações de seguro/plano de saúde de um paciente.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "201", description = "Seguro registrado com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados de requisição inválidos", content = @Content)
  })
  ResponseEntity<ResponseWrapper<PatientInsurance>> addInsurance(
    @Parameter(description = "Dados do plano de saúde", required = true) @RequestBody InsuranceRequest request
  );

  @Operation(summary = "Pagar Fatura", description = "Registra o pagamento manual de uma fatura específica.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Pagamento registrado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Invoice>> payInvoice(
    @Parameter(description = "ID da fatura", required = true) @PathVariable Long invoiceId
  );

  @Operation(summary = "Processar Pagamento via Seguro", description = "Inicia o processamento de uma fatura utilizando o seguro/plano de saúde do paciente.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Processamento iniciado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<Void>> processInsurancePayment(
    @Parameter(description = "ID da fatura", required = true) @PathVariable Long invoiceId
  );

  @Operation(summary = "Listar Faturas Pendentes do Seguro", description = "Retorna faturas que estão aguardando o pagamento e aprovação das operadoras de seguro.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Faturas recuperadas com sucesso")
  })
  ResponseEntity<ResponseWrapper<List<Invoice>>> getPendingInsuranceInvoices();

  @Operation(summary = "Download Fatura (PDF)", description = "Gera e retorna o arquivo PDF referente a uma fatura específica.")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "PDF gerado com sucesso"),
    @ApiResponse(responseCode = "404", description = "Fatura não encontrada", content = @Content)
  })
  ResponseEntity<byte[]> downloadInvoicePdf(
    @Parameter(description = "ID da fatura", required = true) @PathVariable Long id
  );
}