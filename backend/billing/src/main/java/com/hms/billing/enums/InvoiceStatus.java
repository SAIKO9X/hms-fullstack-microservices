package com.hms.billing.enums;

public enum InvoiceStatus {
  PENDING,            // Aguardando pagamento
  PAID,               // Pago pelo paciente
  INSURANCE_PENDING,  // Aguardando processamento do convênio
  CANCELLED           // Consulta cancelada ou erro
}