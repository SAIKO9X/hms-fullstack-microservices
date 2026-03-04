package com.hms.billing.controllers;

import com.hms.billing.docs.BillingControllerDocs;
import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.billing.services.BillingService;
import com.hms.common.dto.response.ResponseWrapper;
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
public class BillingController implements BillingControllerDocs {

  private final BillingService billingService;

  @GetMapping("/invoices/patient/{patientId}")
  public ResponseEntity<ResponseWrapper<List<Invoice>>> getPatientInvoices(@PathVariable String patientId, Authentication authentication) {
    return ResponseEntity.ok(ResponseWrapper.success(billingService.getInvoicesByPatient(patientId)));
  }

  @GetMapping("/invoices/doctor/{doctorId}")
  public ResponseEntity<ResponseWrapper<List<Invoice>>> getDoctorInvoices(@PathVariable String doctorId) {
    return ResponseEntity.ok(ResponseWrapper.success(billingService.getInvoicesByDoctor(doctorId)));
  }

  @PostMapping("/insurance")
  public ResponseEntity<ResponseWrapper<PatientInsurance>> addInsurance(@RequestBody InsuranceRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(
        billingService.registerPatientInsurance(request.patientId(), request.providerId(), request.policyNumber()),
        "Seguro registrado com sucesso."));
  }

  @PostMapping("/invoices/{invoiceId}/pay")
  public ResponseEntity<ResponseWrapper<Invoice>> payInvoice(@PathVariable Long invoiceId) {
    return ResponseEntity.ok(ResponseWrapper.success(billingService.payInvoice(invoiceId), "Pagamento registrado."));
  }

  @PostMapping("/invoices/{invoiceId}/process-insurance")
  public ResponseEntity<ResponseWrapper<Void>> processInsurancePayment(@PathVariable Long invoiceId) {
    billingService.processInsurancePayment(invoiceId);
    return ResponseEntity.ok(ResponseWrapper.success(null, "Processamento de seguro iniciado."));
  }

  @GetMapping("/invoices/pending-insurance")
  public ResponseEntity<ResponseWrapper<List<Invoice>>> getPendingInsuranceInvoices() {
    return ResponseEntity.ok(ResponseWrapper.success(billingService.getPendingInsuranceInvoices()));
  }

  @GetMapping("/invoices/{id}/pdf")
  @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN', 'DOCTOR')")
  public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
    byte[] pdfBytes = billingService.generateInvoicePdf(id);

    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fatura_" + id + ".pdf\"")
      .body(pdfBytes);
  }

  public record InsuranceRequest(String patientId, Long providerId, String policyNumber) {
  }
}