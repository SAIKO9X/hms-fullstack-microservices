package com.hms.pharmacy.controllers;

import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.pharmacy.docs.MedicineInventoryControllerDocs;
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
public class MedicineInventoryController implements MedicineInventoryControllerDocs {

  private final MedicineInventoryService inventoryService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<MedicineInventoryResponse>> addInventoryItem(@Valid @RequestBody MedicineInventoryRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(inventoryService.addInventory(request), "Estoque adicionado."));
  }

  @GetMapping
  public ResponseEntity<ResponseWrapper<PagedResponse<MedicineInventoryResponse>>> getAllInventory(@PageableDefault(size = 10) Pageable pageable) {
    Page<MedicineInventoryResponse> page = inventoryService.getAllInventory(pageable);
    return ResponseEntity.ok(ResponseWrapper.success(PagedResponse.of(page)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ResponseWrapper<MedicineInventoryResponse>> getInventoryItemById(@PathVariable Long id) {
    return ResponseEntity.ok(ResponseWrapper.success(inventoryService.getInventoryById(id)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<MedicineInventoryResponse>> updateInventoryItem(@PathVariable Long id, @Valid @RequestBody MedicineInventoryRequest request) {
    return ResponseEntity.ok(ResponseWrapper.success(inventoryService.updateInventory(id, request), "Item de estoque atualizado."));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ResponseWrapper<Void>> deleteInventoryItem(@PathVariable Long id) {
    inventoryService.deleteInventory(id);
    return ResponseEntity.ok(ResponseWrapper.success(null, "Item de estoque removido."));
  }
}