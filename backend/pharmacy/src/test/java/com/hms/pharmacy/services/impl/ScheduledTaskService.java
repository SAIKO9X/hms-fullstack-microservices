package com.hms.pharmacy.services;

import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.entities.MedicineInventory;
import com.hms.pharmacy.enums.StockStatus;
import com.hms.pharmacy.repositories.MedicineInventoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduledTaskServiceTest {

  @InjectMocks
  private ScheduledTaskService scheduledTaskService;

  @Mock
  private MedicineInventoryRepository inventoryRepository;

  @Mock
  private MedicineService medicineService;

  @Captor
  private ArgumentCaptor<List<MedicineInventory>> inventoryListCaptor;

  @Test
  @DisplayName("Deve processar itens expirados, remover do estoque e atualizar status para EXPIRED")
  void handleExpiredMedicines_WithExpiredItems_ShouldProcessCorrectly() {
    Medicine medicine = new Medicine();
    medicine.setId(100L);

    MedicineInventory expiredItem = new MedicineInventory();
    expiredItem.setId(1L);
    expiredItem.setMedicine(medicine);
    expiredItem.setQuantity(50);
    expiredItem.setStatus(StockStatus.ACTIVE);

    when(inventoryRepository.findByStatusAndExpiryDateBefore(
      eq(StockStatus.ACTIVE), any(LocalDate.class)))
      .thenReturn(List.of(expiredItem));

    scheduledTaskService.handleExpiredMedicines();

    // verifica se chamou o serviço para dar baixa no estoque principal
    verify(medicineService, times(1)).removeStock(100L, 50);

    // verifica se salvou o inventário corretamente
    verify(inventoryRepository, times(1)).saveAll(inventoryListCaptor.capture());
    MedicineInventory savedItem = inventoryListCaptor.getValue().get(0);

    assertEquals(StockStatus.EXPIRED, savedItem.getStatus());
    assertEquals(0, savedItem.getQuantity()); // a quantidade deve ter sido zerada
  }

  @Test
  @DisplayName("Não deve fazer nada se não houver medicamentos expirados")
  void handleExpiredMedicines_NoExpiredItems_ShouldDoNothing() {
    when(inventoryRepository.findByStatusAndExpiryDateBefore(
      eq(StockStatus.ACTIVE), any(LocalDate.class)))
      .thenReturn(Collections.emptyList());

    scheduledTaskService.handleExpiredMedicines();

    verify(medicineService, never()).removeStock(anyLong(), anyInt());
    verify(inventoryRepository, never()).saveAll(any());
  }
}