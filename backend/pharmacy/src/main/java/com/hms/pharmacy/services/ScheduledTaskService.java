package com.hms.pharmacy.services;

import com.hms.pharmacy.entities.MedicineInventory;
import com.hms.pharmacy.enums.StockStatus;
import com.hms.pharmacy.repositories.MedicineInventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledTaskService {

  private final MedicineInventoryRepository inventoryRepository;
  private final MedicineService medicineService;

  /**
   * Corre todos os dias às 2 da manhã.
   * Expressão cron: (segundo minuto hora dia-do-mês mês dia-da-semana)
   */
  @Scheduled(cron = "0 0 2 * * ?")
  @Transactional
  public void handleExpiredMedicines() {
    log.info("A executar tarefa agendada: Verificação de medicamentos expirados...");

    // Encontra todos os lotes ativos que expiraram
    List<MedicineInventory> expiredItems = inventoryRepository.findByStatusAndExpiryDateBefore(
      StockStatus.ACTIVE,
      LocalDate.now()
    );

    if (expiredItems.isEmpty()) {
      log.info("Nenhum medicamento expirado encontrado.");
      return;
    }

    log.warn("Encontrados {} itens de inventário expirados. A atualizar o stock...", expiredItems.size());

    for (MedicineInventory item : expiredItems) {
      // Remove a quantidade do stock total do medicamento
      medicineService.removeStock(item.getMedicine().getId(), item.getQuantity());

      // Marca o item do inventário como expirado
      item.setStatus(StockStatus.EXPIRED);
      // Aqui zera a quantidade para evitar que seja vendido por engano
      item.setQuantity(0);
    }

    inventoryRepository.saveAll(expiredItems);
    log.info("Tarefa concluída. {} itens marcados como expirados e stock atualizado.", expiredItems.size());
  }
}