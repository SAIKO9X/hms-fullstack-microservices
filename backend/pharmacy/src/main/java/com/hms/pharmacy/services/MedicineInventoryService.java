package com.hms.pharmacy.services;

import com.hms.pharmacy.dto.request.MedicineInventoryRequest;
import com.hms.pharmacy.dto.response.MedicineInventoryResponse;

import java.util.List;

public interface MedicineInventoryService {
  MedicineInventoryResponse addInventory(MedicineInventoryRequest request);

  List<MedicineInventoryResponse> getAllInventory();

  MedicineInventoryResponse getInventoryById(Long inventoryId);

  MedicineInventoryResponse updateInventory(Long inventoryId, MedicineInventoryRequest request);

  void deleteInventory(Long inventoryId);

  String sellStock(Long medicineId, Integer quantityToSell);
}