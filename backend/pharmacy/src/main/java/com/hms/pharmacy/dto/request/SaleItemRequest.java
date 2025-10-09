package com.hms.pharmacy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaleItemRequest(
  @NotNull(message = "O ID do medicamento é obrigatório.")
  Long medicineId,

  @NotNull(message = "A quantidade é obrigatória.")
  @Positive(message = "A quantidade deve ser maior que zero.")
  Integer quantity
) {
}