package com.hms.appointment.entities;

import com.hms.appointment.enums.LabItemStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "lab_test_items")
public class LabTestItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String testName;
  private String category;
  private String clinicalIndication;
  private String instructions;

  @Column(name = "result_notes", columnDefinition = "TEXT")
  private String resultNotes;

  @Column(name = "attachment_id")
  private String attachmentId;

  @Enumerated(EnumType.STRING)
  private LabItemStatus status = LabItemStatus.PENDING;

  // Construtor auxiliar
  public LabTestItem(String testName, String category, String clinicalIndication, String instructions) {
    this.testName = testName;
    this.category = category;
    this.clinicalIndication = clinicalIndication;
    this.instructions = instructions;
    this.status = LabItemStatus.PENDING;
  }
}