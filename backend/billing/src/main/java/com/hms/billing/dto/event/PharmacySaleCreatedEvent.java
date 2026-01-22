package com.hms.billing.dto.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PharmacySaleCreatedEvent(
  Long saleId,
  Long patientId,
  String buyerName,
  BigDecimal totalAmount,
  LocalDateTime saleDate
) implements Serializable {}