package com.hms.pharmacy.response;

import com.hms.pharmacy.entities.PharmacySaleItem;

import java.math.BigDecimal;

public record SaleItemResponse(
  String medicineName,
  String batchNo,
  Integer quantity,
  BigDecimal unitPrice,
  BigDecimal totalPrice
) {
  public static SaleItemResponse fromEntity(PharmacySaleItem item) {
    return new SaleItemResponse(
      item.getMedicineName(),
      item.getBatchNo(),
      item.getQuantity(),
      item.getUnitPrice(),
      item.getTotalPrice()
    );
  }
}