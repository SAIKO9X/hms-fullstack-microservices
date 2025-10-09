package com.hms.appointment.services.impl;

import com.hms.appointment.entities.AdverseEffectReport;
import com.hms.appointment.enums.ReportStatus;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.repositories.AdverseEffectReportRepository;
import com.hms.appointment.dto.request.AdverseEffectReportCreateRequest;
import com.hms.appointment.dto.response.AdverseEffectReportResponse;
import com.hms.appointment.services.AdverseEffectReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdverseEffectReportServiceImpl implements AdverseEffectReportService {

  private final AdverseEffectReportRepository reportRepository;

  @Override
  @Transactional
  public AdverseEffectReportResponse createReport(Long patientId, AdverseEffectReportCreateRequest request) {
    AdverseEffectReport report = new AdverseEffectReport();
    report.setPatientId(patientId);
    report.setDoctorId(request.doctorId());
    report.setPrescriptionId(request.prescriptionId());
    report.setDescription(request.description());
    report.setStatus(ReportStatus.REPORTED); // Status inicial

    AdverseEffectReport savedReport = reportRepository.save(report);
    return AdverseEffectReportResponse.fromEntity(savedReport);
  }

  @Override
  @Transactional(readOnly = true)
  public List<AdverseEffectReportResponse> getReportsByDoctorId(Long doctorId) {
    return reportRepository.findByDoctorIdOrderByReportedAtDesc(doctorId).stream()
      .map(AdverseEffectReportResponse::fromEntity)
      .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public AdverseEffectReportResponse markAsReviewed(Long reportId, Long doctorId) {
    AdverseEffectReport report = reportRepository.findById(reportId)
      .orElseThrow(() -> new AppointmentNotFoundException("Relatório com ID " + reportId + " não encontrado."));

    // Apenas o médico associado pode marcar como lido
    if (!report.getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado. Apenas o médico responsável pode modificar este relatório.");
    }

    report.setStatus(ReportStatus.REVIEWED);
    reportRepository.save(report);
    return AdverseEffectReportResponse.fromEntity(report);
  }
}