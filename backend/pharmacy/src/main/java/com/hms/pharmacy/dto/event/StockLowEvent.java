package com.hms.pharmacy.dto.event;

public record StockLowEvent(
  Long medicineId,
  String medicineName,
  Integer currentQuantity,
  Integer threshold
) {
}