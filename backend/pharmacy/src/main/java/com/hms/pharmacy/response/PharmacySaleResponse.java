package com.hms.pharmacy.response;

import com.hms.pharmacy.entities.PharmacySale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record PharmacySaleResponse(
  Long id,
  Long originalPrescriptionId,
  Long patientId,
  String buyerName,
  String buyerContact,
  LocalDateTime saleDate,
  BigDecimal totalAmount,
  List<SaleItemResponse> items
) {
  public static PharmacySaleResponse fromEntity(PharmacySale sale) {
    return new PharmacySaleResponse(
      sale.getId(),
      sale.getOriginalPrescriptionId(),
      sale.getPatientId(),
      sale.getBuyerName(),
      sale.getBuyerContact(),
      sale.getSaleDate(),
      sale.getTotalAmount(),
      sale.getItems().stream()
        .map(SaleItemResponse::fromEntity)
        .collect(Collectors.toList())
    );
  }
}