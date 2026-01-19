package com.hms.billing.controllers;

import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.billing.services.BillingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

  private final BillingService billingService;

  @GetMapping("/invoices/patient/{patientId}")
  public ResponseEntity<List<Invoice>> getPatientInvoices(@PathVariable String patientId) {
    return ResponseEntity.ok(billingService.getInvoicesByPatient(patientId));
  }

  @GetMapping("/invoices/doctor/{doctorId}")
  public ResponseEntity<List<Invoice>> getDoctorInvoices(@PathVariable String doctorId) {
    return ResponseEntity.ok(billingService.getInvoicesByDoctor(doctorId));
  }

  @PostMapping("/insurance")
  public ResponseEntity<PatientInsurance> addInsurance(@RequestBody InsuranceRequest request) {
    return ResponseEntity.ok(billingService.registerPatientInsurance(
      request.getPatientId(),
      request.getProviderId(),
      request.getPolicyNumber()
    ));
  }

  @PostMapping("/invoices/{invoiceId}/pay")
  public ResponseEntity<Invoice> payInvoice(@PathVariable String invoiceId) {
    return ResponseEntity.ok(billingService.payInvoice(invoiceId));
  }

  // DTO Interno simples para o Request
  @Data
  public static class InsuranceRequest {
    private String patientId;
    private Long providerId;
    private String policyNumber;
  }
}