package com.hms.pharmacy.services;

import com.hms.pharmacy.dto.request.MedicineRequest;
import com.hms.pharmacy.dto.response.MedicineResponse;

import java.util.List;

public interface MedicineService {
  MedicineResponse addMedicine(MedicineRequest request);

  MedicineResponse updateMedicine(Long medicineId, MedicineRequest request);

  MedicineResponse getMedicineById(Long medicineId);

  List<MedicineResponse> getAllMedicines();

  Integer getStockById(Long medicineId);

  Integer addStock(Long medicineId, Integer quantity);

  Integer removeStock(Long medicineId, Integer quantity);
}