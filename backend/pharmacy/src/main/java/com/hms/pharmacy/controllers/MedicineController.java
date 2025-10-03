package com.hms.pharmacy.controllers;

import com.hms.pharmacy.request.MedicineRequest;
import com.hms.pharmacy.response.MedicineResponse;
import com.hms.pharmacy.services.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/medicines")
public class MedicineController {

  private final MedicineService medicineService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
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
  public List<MedicineResponse> getAllMedicines() {
    return medicineService.getAllMedicines();
  }

  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public MedicineResponse updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
    return medicineService.updateMedicine(id, request);
  }
}