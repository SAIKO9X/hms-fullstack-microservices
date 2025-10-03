package com.hms.pharmacy.controllers;

import com.hms.pharmacy.request.PharmacySaleRequest;
import com.hms.pharmacy.response.PharmacySaleResponse;
import com.hms.pharmacy.services.PharmacySaleService;
import jakarta.validation.Valid;
<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
=======
import java.util.List;

>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/sales")
public class PharmacySaleController {

  private final PharmacySaleService saleService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
<<<<<<< HEAD
  public PharmacySaleResponse createSale(
    @Valid @RequestBody PharmacySaleRequest request
  ) {
    return saleService.createSale(request);
  }

  @PostMapping("/direct")
  @ResponseStatus(HttpStatus.CREATED)
  public PharmacySaleResponse createDirectSale(
    @Valid @RequestBody PharmacySaleRequest request
  ) {
    // Utiliza o mesmo DTO e serviço de createSale, mas o ID da prescrição pode ser nulo
=======
  public PharmacySaleResponse createSale(@Valid @RequestBody PharmacySaleRequest request) {
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
    return saleService.createSale(request);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public PharmacySaleResponse getSaleById(@PathVariable Long id) {
    return saleService.getSaleById(id);
  }

  @GetMapping("/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
<<<<<<< HEAD
  public List<PharmacySaleResponse> getSalesByPatient(
    @PathVariable Long patientId
  ) {
=======
  public List<PharmacySaleResponse> getSalesByPatient(@PathVariable Long patientId) {
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
    return saleService.getSalesByPatientId(patientId);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<PharmacySaleResponse> getAllSales() {
    return saleService.getAllSales();
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
