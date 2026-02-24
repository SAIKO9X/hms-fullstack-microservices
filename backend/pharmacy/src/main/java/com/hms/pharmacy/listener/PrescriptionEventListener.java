package com.hms.pharmacy.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.common.dto.event.EventEnvelope;
import com.hms.pharmacy.config.RabbitMQConfig;
import com.hms.pharmacy.dto.event.PrescriptionIssuedEvent;
import com.hms.pharmacy.dto.event.StockLowEvent;
import com.hms.pharmacy.entities.Medicine;
import com.hms.pharmacy.entities.PrescriptionCopy;
import com.hms.pharmacy.repositories.MedicineRepository;
import com.hms.pharmacy.repositories.PrescriptionCopyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class PrescriptionEventListener {

  private final PrescriptionCopyRepository repository;
  private final MedicineRepository medicineRepository;
  private final RabbitTemplate rabbitTemplate;
  private final ObjectMapper objectMapper;

  @Value("${application.rabbitmq.exchange:hms.exchange}")
  private String exchange;

  @RabbitListener(queues = RabbitMQConfig.PRESCRIPTION_QUEUE)
  public void handlePrescriptionEvent(PrescriptionIssuedEvent event) {
    log.info("Recebida nova receita: ID {}", event.prescriptionId());

    try {
      PrescriptionCopy copy = new PrescriptionCopy();
      copy.setPrescriptionId(event.prescriptionId());
      copy.setPatientId(event.patientId());
      copy.setDoctorId(event.doctorId());
      copy.setValidUntil(event.validUntil());
      copy.setNotes(event.notes());

      String itemsJson = objectMapper.writeValueAsString(event.items());
      copy.setItemsJson(itemsJson);

      repository.save(copy);
      log.info("Receita sincronizada com sucesso na Farmácia.");

      // verifica cada item da receita para checar o estoque
      event.items().forEach(item -> {
        String requestedMedicineName = item.medicineName();
        String requestedDosage = item.dosage();

        Optional<Medicine> medicineOpt = medicineRepository.findByNameIgnoreCaseAndDosageIgnoreCase(requestedMedicineName, requestedDosage);

        if (medicineOpt.isEmpty()) {
          // remédio não existe no sistema (médico digitou em texto livre)
          publishRestockAlert(null, requestedMedicineName + " (" + requestedDosage + ")", 0, 10);
        } else {
          // remédio existe, checa o estoque total consolidado
          Medicine medicine = medicineOpt.get();
          if (medicine.getTotalStock() == null || medicine.getTotalStock() <= 0) {
            publishRestockAlert(medicine.getId(), medicine.getName() + " (" + medicine.getDosage() + ")", medicine.getTotalStock() == null ? 0 : medicine.getTotalStock(), 10);
          }
        }
      });

    } catch (Exception e) {
      log.error("Erro ao processar receita e verificar estoque", e);
    }
  }

  // publica um evento de alerta de estoque baixo para o ADMIN
  private void publishRestockAlert(Long medicineId, String medicineName, int currentQty, int threshold) {
    log.warn("Alerta de falta disparado para notificar ADMIN. Remédio: {}", medicineName);

    StockLowEvent alertEvent = new StockLowEvent(medicineId, medicineName, currentQty, threshold);

    EventEnvelope<StockLowEvent> envelope = EventEnvelope.create(
      "STOCK_LOW_EVENT",
      medicineId != null ? String.valueOf(medicineId) : UUID.randomUUID().toString(),
      alertEvent
    );

    rabbitTemplate.convertAndSend(exchange, "pharmacy.stock.low", envelope);
  }
}