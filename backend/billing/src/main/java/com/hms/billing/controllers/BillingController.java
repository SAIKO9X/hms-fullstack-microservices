package com.hms.billing.controllers;

import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.billing.services.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

  private final BillingService billingService;

  @GetMapping("/invoices/patient/{patientId}")
  @ResponseStatus(HttpStatus.OK)
  public List<Invoice> getPatientInvoices(@PathVariable String patientId) {
    return billingService.getInvoicesByPatient(patientId);
  }

  @GetMapping("/invoices/doctor/{doctorId}")
  @ResponseStatus(HttpStatus.OK)
  public List<Invoice> getDoctorInvoices(@PathVariable String doctorId) {
    return billingService.getInvoicesByDoctor(doctorId);
  }

  @PostMapping("/insurance")
  @ResponseStatus(HttpStatus.CREATED)
  public PatientInsurance addInsurance(@RequestBody InsuranceRequest request) {
    return billingService.registerPatientInsurance(
      request.patientId(),
      request.providerId(),
      request.policyNumber()
    );
  }

  @PostMapping("/invoices/{invoiceId}/pay")
  @ResponseStatus(HttpStatus.OK)
  public Invoice payInvoice(@PathVariable String invoiceId) {
    return billingService.payInvoice(invoiceId);
  }

  @PostMapping("/invoices/{invoiceId}/process-insurance")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void processInsurancePayment(@PathVariable String invoiceId) {
    billingService.processInsurancePayment(invoiceId);
  }

  @GetMapping("/invoices/pending-insurance")
  @ResponseStatus(HttpStatus.OK)
  public List<Invoice> getPendingInsuranceInvoices() {
    return billingService.getPendingInsuranceInvoices();
  }


  // DTO Interno simples para o Request
  public record InsuranceRequest(
    String patientId,
    Long providerId,
    String policyNumber
  ) {
  }
}