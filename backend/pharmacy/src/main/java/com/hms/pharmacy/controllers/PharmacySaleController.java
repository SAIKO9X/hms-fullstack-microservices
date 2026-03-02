package com.hms.pharmacy.controllers;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.security.Auditable;
import com.hms.common.security.SecurityUtils;
import com.hms.pharmacy.docs.PharmacySaleControllerDocs;
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
public class PharmacySaleController implements PharmacySaleControllerDocs {

  private final PharmacySaleService saleService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<PharmacySaleResponse>> createSale(@Valid @RequestBody PharmacySaleRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(saleService.createSale(request), "Venda registrada com sucesso."));
  }

  @PostMapping("/direct")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<PharmacySaleResponse>> createDirectSale(@Valid @RequestBody DirectSaleRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(saleService.createDirectSale(request), "Venda direta registrada."));
  }

  @PostMapping("/from-prescription")
  @PreAuthorize("hasRole('ADMIN')")
  @Auditable(action = "SALE_FROM_PRESCRIPTION", resourceName = "PharmacySale")
  public ResponseEntity<ResponseWrapper<PharmacySaleResponse>> createSaleFromPrescription(@RequestBody ProcessPrescriptionRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(saleService.processPrescriptionAndCreateSale(request.prescriptionId()), "Venda criada a partir da receita."));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<PharmacySaleResponse>> getSaleById(@PathVariable Long id) {
    return ResponseEntity.ok(ResponseWrapper.success(saleService.getSaleById(id)));
  }

  @GetMapping("/patient/{patientId}")
  @Auditable(action = "VIEW_PATIENT_SALES", resourceName = "PharmacySale")
  public ResponseEntity<ResponseWrapper<List<PharmacySaleResponse>>> getSalesByPatient(
    @PathVariable Long patientId,
    Authentication authentication
  ) {
    Long requesterId = SecurityUtils.getUserId(authentication);
    boolean isAdmin = authentication.getAuthorities().stream()
      .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

    if (!isAdmin && !requesterId.equals(patientId)) {
      throw new AccessDeniedException("Você não tem permissão para ver as compras deste paciente.");
    }

    return ResponseEntity.ok(ResponseWrapper.success(saleService.getSalesByPatientId(patientId)));
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<PagedResponse<PharmacySaleResponse>>> getAllSales(
    @PageableDefault(size = 10, sort = "saleDate", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    Page<PharmacySaleResponse> page = saleService.getAllSales(pageable);
    return ResponseEntity.ok(ResponseWrapper.success(PagedResponse.of(page)));
  }

  @GetMapping("/stats/financial")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<PharmacyFinancialStatsResponse>> getFinancialStats() {
    return ResponseEntity.ok(ResponseWrapper.success(saleService.getFinancialStatsLast30Days()));
  }

  public record ProcessPrescriptionRequest(Long prescriptionId) {
  }
}