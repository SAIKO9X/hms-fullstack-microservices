package com.hms.billing.controllers;

import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.billing.services.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

  private final BillingService billingService;

  @GetMapping("/invoices/patient/{patientId}")
  public ResponseEntity<List<Invoice>> getPatientInvoices(@PathVariable String patientId, Authentication authentication) {
    // validar se quem pede é o dono ou admin
    return ResponseEntity.ok(billingService.getInvoicesByPatient(patientId));
  }

  @GetMapping("/invoices/doctor/{doctorId}")
  public ResponseEntity<List<Invoice>> getDoctorInvoices(@PathVariable String doctorId) {
    return ResponseEntity.ok(billingService.getInvoicesByDoctor(doctorId));
  }

  @PostMapping("/insurance")
  public ResponseEntity<PatientInsurance> addInsurance(@RequestBody InsuranceRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(billingService.registerPatientInsurance(request.patientId(), request.providerId(), request.policyNumber()));
  }

  @PostMapping("/invoices/{invoiceId}/pay")
  public ResponseEntity<Invoice> payInvoice(@PathVariable String invoiceId) {
    return ResponseEntity.ok(billingService.payInvoice(invoiceId));
  }

  @PostMapping("/invoices/{invoiceId}/process-insurance")
  public ResponseEntity<Void> processInsurancePayment(@PathVariable String invoiceId) {
    billingService.processInsurancePayment(invoiceId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/invoices/pending-insurance")
  public ResponseEntity<List<Invoice>> getPendingInsuranceInvoices() {
    return ResponseEntity.ok(billingService.getPendingInsuranceInvoices());
  }

  @GetMapping("/invoices/{id}/pdf")
  @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'DOCTOR')")
  public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable String id) {
    byte[] pdfBytes = billingService.generateInvoicePdf(id);

    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fatura_" + id + ".pdf\"")
      .body(pdfBytes);
  }

  public record InsuranceRequest(String patientId, Long providerId, String policyNumber) {
  }
}