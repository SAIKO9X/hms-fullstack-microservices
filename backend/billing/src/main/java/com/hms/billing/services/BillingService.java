package com.hms.billing.services;

import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;

import java.util.List;

public interface BillingService {
  void generateInvoiceForAppointment(Long appointmentId, String patientId, String doctorId);

  List<Invoice> getInvoicesByPatient(String patientId);

  List<Invoice> getInvoicesByDoctor(String doctorId);

  PatientInsurance registerPatientInsurance(String patientId, Long providerId, String policyNumber);

  Invoice payInvoice(Long invoiceId);

  void processInsurancePayment(Long invoiceId);

  byte[] generateInvoicePdf(Long invoiceId);

  List<Invoice> getPendingInsuranceInvoices();
}