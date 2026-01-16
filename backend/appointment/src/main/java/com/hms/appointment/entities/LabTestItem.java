package com.hms.appointment.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LabTestItem {
  private String testName; // Ex: Hemograma Completo
  private String category; // Ex: Sangue, Imagem, Urina
  private String clinicalIndication; // Ex: Suspeita de Anemia (Justificativa)
  private String instructions; // Ex: Jejum de 8 horas
}