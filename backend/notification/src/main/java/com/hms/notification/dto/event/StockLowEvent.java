package com.hms.notification.dto.event;

public record StockLowEvent(
  Long medicineId,
  String medicineName,
  Integer currentQuantity,
  Integer threshold
) {
}