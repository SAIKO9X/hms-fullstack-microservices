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

  private static final BigDecimal BASE_CONSULTATION_FEE = new BigDecimal("200.00");

  @Override
  @Transactional
  public void generateInvoiceForAppointment(Long appointmentId, String patientId, String doctorId) {
    log.info("Gerando fatura para consulta: {} (Médico: {})", appointmentId, doctorId);

    if (invoiceRepository.findByAppointmentId(appointmentId).isPresent()) {
      log.warn("Fatura já existe para consulta {}", appointmentId);
      return;
    }

    BigDecimal appointmentFee = BASE_CONSULTATION_FEE;

    try {
      if (doctorId != null) {
        // O Feign Client espera String, o profile-service converte
        DoctorDTO doctor = profileClient.getDoctor(doctorId);
        if (doctor != null && doctor.consultationFee() != null) {
          appointmentFee = doctor.consultationFee();
          log.info("Valor da consulta atualizado conforme perfil do médico: {}", appointmentFee);
        }
      }
    } catch (Exception e) {
      log.error("Erro ao buscar dados do médico (ID: {}), usando valor padrão. Erro: {}", doctorId, e.getMessage());
    }

    final BigDecimal finalFee = appointmentFee;

    Invoice invoice = Invoice.builder()
      .appointmentId(appointmentId)
      .patientId(patientId)
      .doctorId(doctorId)
      .totalAmount(finalFee)
      .build();

    patientInsuranceRepository.findByPatientId(patientId)
      .filter(ins -> ins.getProvider().isActive() &&
        (ins.getValidUntil() == null || ins.getValidUntil().isAfter(LocalDate.now())))
      .ifPresentOrElse(
        insurance -> {
          BigDecimal coveragePercent = insurance.getProvider().getCoveragePercentage();
          BigDecimal coveredAmount = finalFee.multiply(coveragePercent);
          BigDecimal patientAmount = finalFee.subtract(coveredAmount);

          invoice.setInsuranceCovered(coveredAmount);
          invoice.setPatientPayable(patientAmount);
          invoice.setStatus(InvoiceStatus.INSURANCE_PENDING); // convênio paga depois
          log.info("Convênio aplicado: {} cobrindo {}%", insurance.getProvider().getName(), coveragePercent.multiply(new BigDecimal(100)));
        },
        () -> {
          // Particular
          invoice.setInsuranceCovered(BigDecimal.ZERO);
          invoice.setPatientPayable(finalFee);
          invoice.setStatus(InvoiceStatus.PENDING);
          log.info("Nenhum convênio encontrado. Cobrança particular.");
        }
      );

    invoiceRepository.save(invoice);
  }

  @Override
  public List<Invoice> getInvoicesByPatient(String patientId) {
    return invoiceRepository.findByPatientId(patientId);
  }

  @Override
  public List<Invoice> getInvoicesByDoctor(String doctorId) {
    return invoiceRepository.findByDoctorId(doctorId);
  }

  @Override
  @Transactional
  public PatientInsurance registerPatientInsurance(String patientId, Long providerId, String policyNumber) {
    InsuranceProvider provider = providerRepository.findById(providerId)
      .orElseThrow(() -> new RuntimeException("Seguradora não encontrada"));

    PatientInsurance insurance = PatientInsurance.builder()
      .patientId(patientId)
      .provider(provider)
      .policyNumber(policyNumber)
      .validUntil(LocalDate.now().plusYears(1))
      .build();

    return patientInsuranceRepository.save(insurance);
  }

  @Override
  @Transactional
  public Invoice payInvoice(String invoiceId) {
    Invoice invoice = invoiceRepository.findById(invoiceId)
      .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));

    if (invoice.getPatientPaidAt() != null) {
      throw new RuntimeException("Parte do paciente já foi paga.");
    }

    invoice.setPatientPaidAt(LocalDateTime.now());
    checkAndFinalizeInvoice(invoice);
    return invoiceRepository.save(invoice);
  }

  @Override
  @Transactional
  public void processInsurancePayment(String invoiceId) {
    Invoice invoice = invoiceRepository.findById(invoiceId)
      .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));

    if (invoice.getInsuranceCovered().compareTo(BigDecimal.ZERO) == 0) {
      log.warn("Tentativa de processar convênio para fatura particular: {}", invoiceId);
      return;
    }

    invoice.setInsurancePaidAt(LocalDateTime.now());
    checkAndFinalizeInvoice(invoice);
    invoiceRepository.save(invoice);
  }

  @Override
  @Transactional(readOnly = true)
  public byte[] generateInvoicePdf(String invoiceId) {
    Invoice invoice = invoiceRepository.findById(invoiceId)
      .orElseThrow(() -> new RuntimeException("Fatura não encontrada"));

    log.info("Iniciando geração de PDF para fatura: {}", invoiceId);

    String insuranceName = null;
    BigDecimal insuranceCovered = invoice.getInsuranceCovered() != null ?
      invoice.getInsuranceCovered() : BigDecimal.ZERO;

    if (insuranceCovered.compareTo(BigDecimal.ZERO) > 0) {
      try {
        PatientInsurance patientInsurance = patientInsuranceRepository
          .findByPatientId(invoice.getPatientId())
          .orElse(null);

        if (patientInsurance != null && patientInsurance.getProvider() != null) {
          insuranceName = patientInsurance.getProvider().getName();
        }
      } catch (Exception e) {
        log.warn("Erro ao buscar convênio para fatura {}: {}", invoiceId, e.getMessage());
      }
    }

    String patientName = "Paciente (ID: " + invoice.getPatientId() + ")";
    String patientInfo = patientName;
    String doctorName = "Médico (ID: " + invoice.getDoctorId() + ")";
    String doctorInfo = doctorName;

    try {
      PatientDTO patient = profileClient.getPatient(invoice.getPatientId());
      if (patient != null) {
        patientName = patient.name();
        patientInfo = patient.name();
        if (patient.cpf() != null) {
          patientInfo += " (CPF: " + patient.cpf() + ")";
        }
      }

      // Buscar Médico
      if (invoice.getDoctorId() != null) {
        DoctorDTO doctor = profileClient.getDoctor(invoice.getDoctorId());
        if (doctor != null) {
          doctorName = "Dr(a). " + doctor.name();
          doctorInfo = doctorName;
          if (doctor.specialization() != null) {
            doctorInfo += " - " + doctor.specialization();
          }
          if (doctor.crmNumber() != null) {
            doctorInfo += " (CRM: " + doctor.crmNumber() + ")";
          }
        }
      }
    } catch (Exception e) {
      log.error("Falha ao comunicar com Profile Service para enriquecer PDF: {}", e.getMessage());
    }

    // compilaa dados para o template e gerar PDF
    Map<String, Object> data = new HashMap<>();

    // Dados Básicos
    data.put("invoiceId", invoice.getId());
    data.put("issuedAt", invoice.getIssuedAt());
    data.put("paidAt", invoice.getPaidAt());
    data.put("status", invoice.getStatus().name());

    // Flags de Status
    data.put("isPaid", invoice.getStatus() == InvoiceStatus.PAID);
    data.put("isPending", invoice.getStatus() == InvoiceStatus.PENDING || invoice.getStatus() == InvoiceStatus.INSURANCE_PENDING);

    // Dados de Pessoas
    data.put("patientName", patientName);
    data.put("patientInfo", patientInfo);
    data.put("doctorName", doctorName);
    data.put("doctorInfo", doctorInfo);

    // Dados Financeiros
    data.put("hasInsurance", insuranceName != null);
    data.put("insuranceName", insuranceName != null ? insuranceName : "Particular");
    data.put("totalAmount", invoice.getTotalAmount());
    data.put("insuranceCovered", insuranceCovered);
    data.put("patientPayable", invoice.getPatientPayable());

    log.debug("Dados compilados para o template 'invoice'. Gerando bytes...");

    return pdfGeneratorService.generatePdfFromHtml("invoice", data);
  }

  // Método auxiliar para decidir se muda o status geral para PAID
  private void checkAndFinalizeInvoice(Invoice invoice) {
    boolean patientPaid = invoice.getPatientPaidAt() != null || invoice.getPatientPayable().compareTo(BigDecimal.ZERO) == 0;
    boolean insurancePaid = invoice.getInsurancePaidAt() != null || invoice.getInsuranceCovered().compareTo(BigDecimal.ZERO) == 0;

    if (patientPaid && insurancePaid) {
      invoice.setStatus(InvoiceStatus.PAID);
      invoice.setPaidAt(LocalDateTime.now());
    }
    // se o paciente pagou, mas o seguro não, o status continua PENDING
  }

  @Override
  public List<Invoice> getPendingInsuranceInvoices() {
    // casos que o convênio ainda não pagou a parte dele
    return invoiceRepository.findByStatus(InvoiceStatus.INSURANCE_PENDING);
  }
}