package com.hms.pharmacy.controllers;

import com.hms.pharmacy.dto.request.MedicineInventoryRequest;
import com.hms.pharmacy.dto.response.MedicineInventoryResponse;
import com.hms.pharmacy.services.MedicineInventoryService;
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
@RequestMapping("/pharmacy/inventory")
public class MedicineInventoryController {

  private final MedicineInventoryService inventoryService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<MedicineInventoryResponse> addInventoryItem(@Valid @RequestBody MedicineInventoryRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.addInventory(request));
  }

  @GetMapping
  public ResponseEntity<Page<MedicineInventoryResponse>> getAllInventory(@PageableDefault(size = 10) Pageable pageable) {
    return ResponseEntity.ok(inventoryService.getAllInventory(pageable));
  }

  @GetMapping("/{id}")
  public ResponseEntity<MedicineInventoryResponse> getInventoryItemById(@PathVariable Long id) {
    return ResponseEntity.ok(inventoryService.getInventoryById(id));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<MedicineInventoryResponse> updateInventoryItem(@PathVariable Long id, @Valid @RequestBody MedicineInventoryRequest request) {
    return ResponseEntity.ok(inventoryService.updateInventory(id, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Void> deleteInventoryItem(@PathVariable Long id) {
    inventoryService.deleteInventory(id);
    return ResponseEntity.noContent().build();
  }
}