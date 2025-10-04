package com.hms.pharmacy.controllers;

import com.hms.pharmacy.request.PharmacySaleRequest;
import com.hms.pharmacy.response.PharmacySaleResponse;
import com.hms.pharmacy.services.PharmacySaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/sales")
public class PharmacySaleController {

  private final PharmacySaleService saleService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PharmacySaleResponse createSale(@Valid @RequestBody PharmacySaleRequest request) {
    return saleService.createSale(request);
  }

  @PostMapping("/direct")
  @ResponseStatus(HttpStatus.CREATED)
  public PharmacySaleResponse createDirectSale(@Valid @RequestBody PharmacySaleRequest request) {
    // Utiliza o mesmo DTO e serviço de createSale, mas o ID da prescrição pode ser nulo
    return saleService.createSale(request);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public PharmacySaleResponse getSaleById(@PathVariable Long id) {
    return saleService.getSaleById(id);
  }

  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  public List<PharmacySaleResponse> getSalesByPatient(@PathVariable Long patientId) {
    return saleService.getSalesByPatientId(patientId);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<PharmacySaleResponse> getAllSales() {
    return saleService.getAllSales();
  }

  @PostMapping("/from-prescription")
  @ResponseStatus(HttpStatus.CREATED)
  public PharmacySaleResponse createSaleFromPrescription(@RequestBody Long prescriptionId) {
    return saleService.processPrescriptionAndCreateSale(prescriptionId);
  }
}

