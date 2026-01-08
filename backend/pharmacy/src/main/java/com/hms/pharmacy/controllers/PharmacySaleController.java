package com.hms.pharmacy.controllers;

import com.hms.pharmacy.dto.request.DirectSaleRequest;
import com.hms.pharmacy.dto.request.PharmacySaleRequest;
import com.hms.pharmacy.dto.response.PharmacyFinancialStatsResponse;
import com.hms.pharmacy.dto.response.PharmacySaleResponse;
import com.hms.pharmacy.services.PharmacySaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/sales")
public class PharmacySaleController {

  private final PharmacySaleService saleService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')")
  public PharmacySaleResponse createSale(@Valid @RequestBody PharmacySaleRequest request) {
    return saleService.createSale(request);
  }

  @PostMapping("/direct")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')")
  public PharmacySaleResponse createDirectSale(@Valid @RequestBody DirectSaleRequest request) {
    return saleService.createDirectSale(request);
  }

  @PostMapping("/from-prescription")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')")
  public PharmacySaleResponse createSaleFromPrescription(@RequestBody ProcessPrescriptionRequest request) {
    return saleService.processPrescriptionAndCreateSale(request.prescriptionId());
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public PharmacySaleResponse getSaleById(@PathVariable Long id) {
    return saleService.getSaleById(id);
  }

  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN') or #patientId == authentication.principal.id")
  public List<PharmacySaleResponse> getSalesByPatient(@PathVariable Long patientId) {
    return saleService.getSalesByPatientId(patientId);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public Page<PharmacySaleResponse> getAllSales(@PageableDefault(size = 10, sort = "saleDate", direction = Sort.Direction.DESC) Pageable pageable) {
    return saleService.getAllSales(pageable);
  }

  @GetMapping("/stats/financial")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("hasRole('ADMIN')")
  public PharmacyFinancialStatsResponse getFinancialStats() {
    return saleService.getFinancialStatsLast30Days();
  }


  // DTO para processar prescrição (garante JSON válido)
  public record ProcessPrescriptionRequest(Long prescriptionId) {
  }
}