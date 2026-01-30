package com.hms.pharmacy.controllers;

import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
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
  public ResponseEntity<ApiResponse<MedicineResponse>> addMedicine(@Valid @RequestBody MedicineRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ApiResponse.success(medicineService.addMedicine(request), "Medicamento adicionado com sucesso."));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(medicineService.getMedicineById(id)));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<PagedResponse<MedicineResponse>>> getAllMedicines(@PageableDefault(page = 0, size = 10, sort = "name") Pageable pageable) {
    Page<MedicineResponse> page = medicineService.getAllMedicines(pageable);
    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(page)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
    return ResponseEntity.ok(ApiResponse.success(medicineService.updateMedicine(id, request), "Medicamento atualizado."));
  }
}