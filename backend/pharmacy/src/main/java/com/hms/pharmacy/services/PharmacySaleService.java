package com.hms.pharmacy.services;

import com.hms.pharmacy.dto.request.DirectSaleRequest;
import com.hms.pharmacy.dto.request.PharmacySaleRequest;
import com.hms.pharmacy.dto.response.PharmacyFinancialStatsResponse;
import com.hms.pharmacy.dto.response.PharmacySaleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PharmacySaleService {
  PharmacySaleResponse createSale(PharmacySaleRequest request);

  PharmacySaleResponse getSaleById(Long saleId);

  List<PharmacySaleResponse> getSalesByPatientId(Long patientId);

  Page<PharmacySaleResponse> getAllSales(Pageable pageable);

  PharmacySaleResponse processPrescriptionAndCreateSale(Long prescriptionId);

  PharmacySaleResponse createDirectSale(DirectSaleRequest request);

  PharmacyFinancialStatsResponse getFinancialStatsLast30Days();
}