package com.hms.pharmacy.services;

import com.hms.pharmacy.request.DirectSaleRequest;
import com.hms.pharmacy.request.PharmacySaleRequest;
import com.hms.pharmacy.request.PrescriptionReceiveRequest;
import com.hms.pharmacy.response.PharmacySaleResponse;

import java.util.List;

public interface PharmacySaleService {
  PharmacySaleResponse createSale(PharmacySaleRequest request);

  PharmacySaleResponse getSaleById(Long saleId);

  List<PharmacySaleResponse> getSalesByPatientId(Long patientId);

  PharmacySaleResponse processPrescriptionAndCreateSale(PrescriptionReceiveRequest prescriptionRequest);

  List<PharmacySaleResponse> getAllSales();

  PharmacySaleResponse processPrescriptionAndCreateSale(Long prescriptionId);

  PharmacySaleResponse createDirectSale(DirectSaleRequest request);
}