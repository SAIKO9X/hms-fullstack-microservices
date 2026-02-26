package com.hms.pharmacy.services.impl;

import com.hms.common.exceptions.InvalidOperationException;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.entities.MedicineInventory;
import com.hms.pharmacy.enums.StockStatus;
import com.hms.pharmacy.repositories.MedicineInventoryRepository;
import com.hms.pharmacy.services.MedicineService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicineInventoryServiceImplTest {

  @InjectMocks
  private MedicineInventoryServiceImpl inventoryService;

  @Mock
  private MedicineInventoryRepository inventoryRepository;

  @Mock
  private MedicineService medicineService;

  @Mock
  private RabbitTemplate rabbitTemplate;

  @Test
  @DisplayName("Deve abater estoque usando FIFO (Lotes mais próximos do vencimento primeiro)")
  void sellStock_Success_FifoAlgorithm() {
    Long medicineId = 1L;
    Integer quantityToSell = 10;

    Medicine mockMedicine = new Medicine();
    mockMedicine.setId(medicineId);
    mockMedicine.setName("Dipirona");

    // Lote 1: Vence primeiro, mas só tem 4 unidades. Deve ser zerado.
    MedicineInventory batch1 = new MedicineInventory();
    batch1.setId(101L);
    batch1.setMedicine(mockMedicine);
    batch1.setBatchNo("LOTE-ANTIGO");
    batch1.setQuantity(4);
    batch1.setExpiryDate(LocalDate.now().plusMonths(1));
    batch1.setStatus(StockStatus.ACTIVE);

    // Lote 2: Vence depois, tem 20 unidades. Deve fornecer as 6 restantes.
    MedicineInventory batch2 = new MedicineInventory();
    batch2.setId(102L);
    batch2.setMedicine(mockMedicine);
    batch2.setBatchNo("LOTE-NOVO");
    batch2.setQuantity(20);
    batch2.setExpiryDate(LocalDate.now().plusMonths(6));
    batch2.setStatus(StockStatus.ACTIVE);

    // simula o retorno do banco já ordenado pelo vencimento mais próximo (ASC)
    List<MedicineInventory> availableBatches = new ArrayList<>(List.of(batch1, batch2));

    when(inventoryRepository.findByMedicineIdAndStatusAndQuantityGreaterThanOrderByExpiryDateAsc(eq(medicineId), eq(StockStatus.ACTIVE), eq(0)))
      .thenReturn(availableBatches);

    String trackingInfo = inventoryService.sellStock(medicineId, quantityToSell);

    assertTrue(trackingInfo.contains("Lote LOTE-ANTIGO: 4"));
    assertTrue(trackingInfo.contains("Lote LOTE-NOVO: 6"));

    assertEquals(0, batch1.getQuantity(), "O lote mais antigo deveria ter sido zerado");
    assertEquals(StockStatus.DEPLETED, batch1.getStatus(), "O status do lote zerado deve transicionar para DEPLETED");
    assertEquals(14, batch2.getQuantity(), "O lote mais novo deveria ter ficado com 14 unidades (20 - 6)");

    verify(inventoryRepository, times(1)).saveAll(availableBatches);
    verify(medicineService, times(1)).removeStock(medicineId, quantityToSell);
  }

  @Test
  @DisplayName("Deve lançar erro de operação inválida se a soma de todos os lotes não for suficiente")
  void sellStock_Fails_InsufficientTotalStock() {
    Long medicineId = 1L;
    Integer quantityToSell = 50;

    Medicine mockMedicine = new Medicine();
    mockMedicine.setId(medicineId);

    // apenas 10 no estoque total
    MedicineInventory batch1 = new MedicineInventory();
    batch1.setMedicine(mockMedicine);
    batch1.setQuantity(10);
    batch1.setExpiryDate(LocalDate.now().plusMonths(1));
    batch1.setStatus(StockStatus.ACTIVE);

    when(inventoryRepository.findByMedicineIdAndStatusAndQuantityGreaterThanOrderByExpiryDateAsc(eq(medicineId), eq(StockStatus.ACTIVE), eq(0)))
      .thenReturn(List.of(batch1));

    InvalidOperationException exception = assertThrows(InvalidOperationException.class,
      () -> inventoryService.sellStock(medicineId, quantityToSell));

    assertTrue(exception.getMessage().contains("Estoque insuficiente"));

    // garante que nenhuma transação parcial foi comitada
    verify(inventoryRepository, never()).saveAll(any());
  }

  @Test
  @DisplayName("Deve lançar erro ao tentar vender um item que não possui lotes válidos cadastrados")
  void sellStock_Fails_NoBatchesAvailable() {
    when(inventoryRepository.findByMedicineIdAndStatusAndQuantityGreaterThanOrderByExpiryDateAsc(anyLong(), eq(StockStatus.ACTIVE), eq(0)))
      .thenReturn(List.of());

    InvalidOperationException exception = assertThrows(InvalidOperationException.class,
      () -> inventoryService.sellStock(1L, 5));

    assertTrue(exception.getMessage().contains("Estoque insuficiente"));
  }
}