package com.hms.pharmacy.controllers;

import com.hms.pharmacy.request.MedicineInventoryRequest;
import com.hms.pharmacy.response.MedicineInventoryResponse;
import com.hms.pharmacy.services.MedicineInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pharmacy/inventory")
public class MedicineInventoryController {

  private final MedicineInventoryService inventoryService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasRole('ADMIN')")
  public MedicineInventoryResponse addInventoryItem(@Valid @RequestBody MedicineInventoryRequest request) {
    return inventoryService.addInventory(request);
  }

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
  public List<MedicineInventoryResponse> getAllInventory() {
    return inventoryService.getAllInventory();
  }

  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public MedicineInventoryResponse getInventoryItemById(@PathVariable Long id) {
    return inventoryService.getInventoryById(id);
  }

  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public MedicineInventoryResponse updateInventoryItem(@PathVariable Long id, @Valid @RequestBody MedicineInventoryRequest request) {
    return inventoryService.updateInventory(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteInventoryItem(@PathVariable Long id) {
    inventoryService.deleteInventory(id);
    return ResponseEntity.noContent().build();
  }
}