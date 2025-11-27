package com.hms.pharmacy.services;

import com.hms.pharmacy.dto.request.MedicineInventoryRequest;
import com.hms.pharmacy.dto.response.MedicineInventoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MedicineInventoryService {
  MedicineInventoryResponse addInventory(MedicineInventoryRequest request);

  Page<MedicineInventoryResponse> getAllInventory(Pageable pageable);

  MedicineInventoryResponse getInventoryById(Long inventoryId);

  MedicineInventoryResponse updateInventory(Long inventoryId, MedicineInventoryRequest request);

  void deleteInventory(Long inventoryId);

  String sellStock(Long medicineId, Integer quantityToSell);
}