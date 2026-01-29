package com.hms.billing.services.impl;

import com.hms.billing.clients.ProfileFeignClient;
import com.hms.billing.dto.external.DoctorDTO;
import com.hms.billing.dto.external.PatientDTO;
import com.hms.billing.entities.InsuranceProvider;
import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.billing.enums.InvoiceStatus;
import com.hms.billing.repositories.InsuranceProviderRepository;
import com.hms.billing.repositories.InvoiceRepository;
import com.hms.billing.repositories.PatientInsuranceRepository;
import com.hms.billing.services.BillingService;
import com.hms.common.services.PdfGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingServiceImpl implements BillingService {

  private final InvoiceRepository invoiceRepository;
  private final PatientInsuranceRepository patientInsuranceRepository;
  private final PdfGeneratorService pdfGeneratorService;
  private final InsuranceProviderRepository providerRepository;
  private final ProfileFeignClient profileClient;

  private static final BigDecimal BASE_FEE = new BigDecimal("200.00");

  @Override
  @Transactional
  public void generateInvoiceForAppointment(Long appointmentId, String patientId, String doctorId) {
    if (invoiceRepository.findByAppointmentId(appointmentId).isPresent()) return;

    BigDecimal fee = fetchConsultationFee(doctorId);

    Invoice invoice = Invoice.builder()
      .appointmentId(appointmentId).patientId(patientId).doctorId(doctorId).totalAmount(fee).build();

    applyInsuranceIfAvailable(invoice, patientId, fee);
    invoiceRepository.save(invoice);
  }

  @Override
  public List<Invoice> getInvoicesByPatient(String id) {
    return invoiceRepository.findByPatientId(id);
  }

  @Override
  public List<Invoice> getInvoicesByDoctor(String id) {
    return invoiceRepository.findByDoctorId(id);
  }

  @Override
  public List<Invoice> getPendingInsuranceInvoices() {
    return invoiceRepository.findByStatus(InvoiceStatus.INSURANCE_PENDING);
  }

  @Override
  @Transactional
  public PatientInsurance registerPatientInsurance(String patientId, Long providerId, String policyNumber) {
    InsuranceProvider provider = providerRepository.findById(providerId).orElseThrow(() -> new RuntimeException("Seguradora não encontrada"));
    return patientInsuranceRepository.save(PatientInsurance.builder()
      .patientId(patientId).provider(provider).policyNumber(policyNumber).validUntil(LocalDate.now().plusYears(1)).build());
  }

  @Override
  @Transactional
  public Invoice payInvoice(String invoiceId) {
    Invoice invoice = findInvoice(invoiceId);
    if (invoice.getPatientPaidAt() != null) throw new RuntimeException("Já pago pelo paciente.");

    invoice.setPatientPaidAt(LocalDateTime.now());
    checkFinalize(invoice);
    return invoiceRepository.save(invoice);
  }

  @Override
  @Transactional
  public void processInsurancePayment(String invoiceId) {
    Invoice invoice = findInvoice(invoiceId);
    if (invoice.getInsuranceCovered().compareTo(BigDecimal.ZERO) == 0) return;

    invoice.setInsurancePaidAt(LocalDateTime.now());
    checkFinalize(invoice);
    invoiceRepository.save(invoice);
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] generateInvoicePdf(String invoiceId) {
    Invoice invoice = findInvoice(invoiceId);
    Map<String, Object> data = buildPdfData(invoice);
    return pdfGeneratorService.generatePdfFromHtml("invoice", data);
  }

  private Invoice findInvoice(String id) {
    return invoiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Fatura não encontrada: " + id));
  }

  private BigDecimal fetchConsultationFee(String doctorId) {
    try {
      if (doctorId == null) return BASE_FEE;
      DoctorDTO doc = profileClient.getDoctor(doctorId);
      return (doc != null && doc.consultationFee() != null) ? doc.consultationFee() : BASE_FEE;
    } catch (Exception e) {
      log.warn("Erro ao buscar taxa do médico, usando base. {}", e.getMessage());
      return BASE_FEE;
    }
  }

  private void applyInsuranceIfAvailable(Invoice invoice, String patientId, BigDecimal fee) {
    patientInsuranceRepository.findByPatientId(patientId)
      .filter(i -> i.getProvider().isActive() && (i.getValidUntil() == null || i.getValidUntil().isAfter(LocalDate.now())))
      .ifPresentOrElse(ins -> {
        BigDecimal covered = fee.multiply(ins.getProvider().getCoveragePercentage());
        invoice.setInsuranceCovered(covered);
        invoice.setPatientPayable(fee.subtract(covered));
        invoice.setStatus(InvoiceStatus.INSURANCE_PENDING);
      }, () -> {
        invoice.setInsuranceCovered(BigDecimal.ZERO);
        invoice.setPatientPayable(fee);
        invoice.setStatus(InvoiceStatus.PENDING);
      });
  }

  private void checkFinalize(Invoice inv) {
    boolean pPaid = inv.getPatientPaidAt() != null || inv.getPatientPayable().compareTo(BigDecimal.ZERO) == 0;
    boolean iPaid = inv.getInsurancePaidAt() != null || inv.getInsuranceCovered().compareTo(BigDecimal.ZERO) == 0;
    if (pPaid && iPaid) {
      inv.setStatus(InvoiceStatus.PAID);
      inv.setPaidAt(LocalDateTime.now());
    }
  }

  private Map<String, Object> buildPdfData(Invoice invoice) {
    Map<String, Object> data = new HashMap<>();
    data.put("invoiceId", invoice.getId());
    data.put("issuedAt", invoice.getIssuedAt());
    data.put("totalAmount", invoice.getTotalAmount());
    data.put("status", invoice.getStatus());

    // dados padrão
    String pName = "Paciente " + invoice.getPatientId();
    String dName = "Médico " + invoice.getDoctorId();

    // tentar buscar nomes reais via Profile Service
    try {
      PatientDTO p = profileClient.getPatient(invoice.getPatientId());
      if (p != null) pName = p.name() + (p.cpf() != null ? " (CPF: " + p.cpf() + ")" : "");

      if (invoice.getDoctorId() != null) {
        DoctorDTO d = profileClient.getDoctor(invoice.getDoctorId());
        if (d != null) dName = "Dr. " + d.name();
      }
    } catch (Exception e) {
      log.warn("PDF parcial: {}", e.getMessage());
    }

    data.put("patientName", pName);
    data.put("doctorName", dName);
    return data;
  }
}