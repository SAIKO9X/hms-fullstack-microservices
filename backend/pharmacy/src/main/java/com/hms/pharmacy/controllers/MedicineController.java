package com.hms.pharmacy.controllers;

import com.hms.pharmacy.dto.request.MedicineRequest;
import com.hms.pharmacy.dto.response.MedicineResponse;
import com.hms.pharmacy.services.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/medicines")
public class MedicineController {

  private final MedicineService medicineService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')")
  public MedicineResponse addMedicine(@Valid @RequestBody MedicineRequest request) {
    return medicineService.addMedicine(request);
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public MedicineResponse getMedicineById(@PathVariable Long id) {
    return medicineService.getMedicineById(id);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public Page<MedicineResponse> getAllMedicines(@PageableDefault(page = 0, size = 10, sort = "name") Pageable pageable) {
    // O @PageableDefault define valores padrão
    return medicineService.getAllMedicines(pageable);
  }

  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public MedicineResponse updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
    return medicineService.updateMedicine(id, request);
  }
}