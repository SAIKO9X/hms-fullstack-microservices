package com.hms.pharmacy.controllers;

import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/sales")
public class PharmacySaleController {

  private final PharmacySaleService saleService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PharmacySaleResponse> createSale(@Valid @RequestBody PharmacySaleRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
  }

  @PostMapping("/direct")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PharmacySaleResponse> createDirectSale(@Valid @RequestBody DirectSaleRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createDirectSale(request));
  }

  @PostMapping("/from-prescription")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "SALE_FROM_PRESCRIPTION", resourceName = "PharmacySale")
  public ResponseEntity<PharmacySaleResponse> createSaleFromPrescription(@RequestBody ProcessPrescriptionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(saleService.processPrescriptionAndCreateSale(request.prescriptionId()));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PharmacySaleResponse> getSaleById(@PathVariable Long id) {
    return ResponseEntity.ok(saleService.getSaleById(id));
  }

  @GetMapping("/patient/{patientId}")
  @Auditable(action = "VIEW_PATIENT_SALES", resourceName = "PharmacySale")
  public ResponseEntity<List<PharmacySaleResponse>> getSalesByPatient(
    @PathVariable Long patientId,
    Authentication authentication
  ) {
    // verifica se o usuário é admin ou o próprio paciente
    Long requesterId = SecurityUtils.getUserId(authentication);
    boolean isAdmin = authentication.getAuthorities().stream()
      .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

    if (!isAdmin && !requesterId.equals(patientId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(saleService.getSalesByPatientId(patientId));
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<PharmacySaleResponse>> getAllSales(
    @PageableDefault(size = 10, sort = "saleDate", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    return ResponseEntity.ok(saleService.getAllSales(pageable));
  }

  @GetMapping("/stats/financial")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<PharmacyFinancialStatsResponse> getFinancialStats() {
    return ResponseEntity.ok(saleService.getFinancialStatsLast30Days());
  }

  public record ProcessPrescriptionRequest(Long prescriptionId) {
  }
}