package com.hms.pharmacy.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PharmacySaleRequest(
  @NotNull(message = "O ID da prescrição original é obrigatório.")
  Long originalPrescriptionId,

  @NotNull(message = "O ID do paciente é obrigatório.")
  Long patientId,

  @NotEmpty(message = "A lista de itens não pode ser vazia.")
  List<SaleItemRequest> items
) {
}