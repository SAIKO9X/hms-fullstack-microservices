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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/medicines")
public class MedicineController {

  private final MedicineService medicineService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<MedicineResponse> addMedicine(@Valid @RequestBody MedicineRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.addMedicine(request));
  }

  @GetMapping("/{id}")
  public ResponseEntity<MedicineResponse> getMedicineById(@PathVariable Long id) {
    return ResponseEntity.ok(medicineService.getMedicineById(id));
  }

  @GetMapping
  public ResponseEntity<Page<MedicineResponse>> getAllMedicines(@PageableDefault(page = 0, size = 10, sort = "name") Pageable pageable) {
    return ResponseEntity.ok(medicineService.getAllMedicines(pageable));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<MedicineResponse> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
    return ResponseEntity.ok(medicineService.updateMedicine(id, request));
  }
}