package com.hms.billing.services.impl;

import com.hms.billing.clients.ProfileFeignClient;
import com.hms.billing.entities.InsuranceProvider;
import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.billing.enums.InvoiceStatus;
import com.hms.billing.external.DoctorDTO;
import com.hms.billing.repositories.InsuranceProviderRepository;
import com.hms.billing.repositories.InvoiceRepository;
import com.hms.billing.repositories.PatientInsuranceRepository;
import com.hms.billing.services.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingServiceImpl implements BillingService {

  private final InvoiceRepository invoiceRepository;
  private final PatientInsuranceRepository patientInsuranceRepository;
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

    patientInsuranceRepository.findByPatientId(patientId).ifPresentOrElse(
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

    if (invoice.getStatus() == InvoiceStatus.PAID) {
      throw new RuntimeException("Fatura já está paga");
    }

    // Futuro: integração com Gateway de Pagamento
    invoice.setStatus(InvoiceStatus.PAID);
    invoice.setPaidAt(LocalDateTime.now());

    return invoiceRepository.save(invoice);
  }
}