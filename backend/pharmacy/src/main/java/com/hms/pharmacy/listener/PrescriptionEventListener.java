package com.hms.pharmacy.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.pharmacy.config.RabbitMQConfig;
import com.hms.pharmacy.dto.event.PrescriptionIssuedEvent;
import com.hms.pharmacy.entities.PrescriptionCopy;
import com.hms.pharmacy.repositories.PrescriptionCopyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class PrescriptionEventListener {

  private final PrescriptionCopyRepository repository;
  private final ObjectMapper objectMapper;

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

      // Converte a lista de itens para JSON String para facilitar armazenamento simples
      String itemsJson = objectMapper.writeValueAsString(event.items());
      copy.setItemsJson(itemsJson);

      repository.save(copy);
      log.info("Receita sincronizada com sucesso na Farmácia.");

    } catch (Exception e) {
      log.error("Erro ao salvar cópia da receita", e);
    }
  }
}