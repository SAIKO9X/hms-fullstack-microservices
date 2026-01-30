package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.dto.event.PrescriptionIssuedEvent;
import com.hms.appointment.dto.external.DoctorProfile;
import com.hms.appointment.dto.external.PatientProfile;
import com.hms.appointment.dto.request.MedicineRequest;
import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.Medicine;
import com.hms.appointment.entities.Prescription;
import com.hms.appointment.enums.PrescriptionStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.PrescriptionRepository;
import com.hms.appointment.services.PrescriptionService;
import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.common.services.PdfGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

  private final PrescriptionRepository prescriptionRepository;
  private final AppointmentRepository appointmentRepository;
  private final ProfileFeignClient profileClient;
  private final PdfGeneratorService pdfGeneratorService;
  private final RabbitTemplate rabbitTemplate;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.prescription-issued-routing-key}")
  private String prescriptionIssuedRoutingKey;

  @Override
  @Transactional
  public PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new ResourceNotFoundException("Appointment", request.appointmentId()));

    validateDoctorAuthority(appointment, doctorId);

    if (prescriptionRepository.findByAppointmentId(request.appointmentId()).isPresent()) {
      throw new InvalidOperationException("Já existe uma prescrição para esta consulta.");
    }

    Prescription newPrescription = new Prescription();
    newPrescription.setAppointment(appointment);
    newPrescription.setNotes(request.notes());
    newPrescription.setMedicines(mapToMedicineEntities(request.medicines()));

    Prescription saved = prescriptionRepository.save(newPrescription);
    publishPrescriptionEvent(saved);

    return PrescriptionResponse.fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId) {
    return prescriptionRepository.findByAppointmentId(appointmentId)
      .map(prescription -> {
        validateViewerAuthority(prescription.getAppointment(), requesterId);
        return PrescriptionResponse.fromEntity(prescription);
      })
      .orElse(null);
  }

  @Override
  @Transactional
  public PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long doctorId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

    validateDoctorAuthority(prescription.getAppointment(), doctorId);

    prescription.setMedicines(mapToMedicineEntities(request.medicines()));
    prescription.setNotes(request.notes());

    return PrescriptionResponse.fromEntity(prescriptionRepository.save(prescription));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PrescriptionResponse> getPrescriptionsByPatientId(Long patientId, Long requesterId, Pageable pageable) {
    if (patientId.equals(requesterId)) {
      return prescriptionRepository.findByAppointmentPatientId(patientId, pageable)
        .map(PrescriptionResponse::fromEntity);
    }

    boolean hasRelationship = appointmentRepository.existsByDoctorIdAndPatientId(requesterId, patientId);
    if (!hasRelationship) {
      throw new AccessDeniedException("Acesso negado. Você não possui histórico de consultas com este paciente.");
    }

    return prescriptionRepository.findByAppointmentPatientId(patientId, pageable)
      .map(PrescriptionResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionForPharmacyResponse getPrescriptionForPharmacy(Long prescriptionId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

    if (prescription.getStatus() == PrescriptionStatus.DISPENSED) {
      throw new InvalidOperationException("Esta prescrição já foi utilizada.");
    }

    return PrescriptionForPharmacyResponse.fromEntity(prescription);
  }

  @Override
  @Transactional
  public void markAsDispensed(Long prescriptionId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

    if (prescription.getStatus() == PrescriptionStatus.DISPENSED) {
      return;
    }

    prescription.setStatus(PrescriptionStatus.DISPENSED);
    prescriptionRepository.save(prescription);
    log.info("Prescrição ID {} marcada como aviada.", prescriptionId);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getLatestPrescriptionByPatientId(Long patientId) {
    return prescriptionRepository.findFirstByAppointmentPatientIdOrderByCreatedAtDesc(patientId)
      .map(PrescriptionResponse::fromEntity)
      .orElse(null);
  }

  @Override
  public byte[] generatePrescriptionPdf(Long prescriptionId, Long requesterId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

    validateViewerAuthority(prescription.getAppointment(), requesterId);

    Map<String, Object> data = buildPdfContext(prescription);

    return pdfGeneratorService.generatePdfFromHtml("prescription", data);
  }

  private void validateDoctorAuthority(Appointment appointment, Long doctorId) {
    if (!appointment.getDoctorId().equals(doctorId)) {
      throw new AccessDeniedException("Acesso negado. Apenas o médico responsável pode realizar esta ação.");
    }
  }

  private void validateViewerAuthority(Appointment appointment, Long requesterId) {
    if (!appointment.getDoctorId().equals(requesterId) && !appointment.getPatientId().equals(requesterId)) {
      throw new AccessDeniedException("Acesso negado. Você não tem permissão para visualizar este registro.");
    }
  }

  private List<Medicine> mapToMedicineEntities(List<MedicineRequest> dtos) {
    return dtos.stream().map(dto -> {
      Medicine med = new Medicine();
      med.setName(dto.name());
      med.setDosage(dto.dosage());
      med.setFrequency(dto.frequency());
      med.setDuration(dto.duration());
      return med;
    }).collect(Collectors.toList());
  }

  private Map<String, Object> buildPdfContext(Prescription prescription) {
    String doctorName = "Dr. Desconhecido";
    String doctorCrm = "N/A";
    String patientName = "Paciente";

    try {
      DoctorProfile doctor = profileClient.getDoctor(prescription.getAppointment().getDoctorId());
      if (doctor != null) {
        doctorName = doctor.name();
        doctorCrm = doctor.crmNumber();
      }

      PatientProfile patient = profileClient.getPatient(prescription.getAppointment().getPatientId());
      if (patient != null) {
        patientName = patient.name();
      }
    } catch (Exception e) {
      log.warn("Falha ao obter dados de perfil para PDF da prescrição {}: {}", prescription.getId(), e.getMessage());
    }

    Map<String, Object> data = new HashMap<>();
    data.put("prescriptionId", prescription.getId());
    data.put("createdAt", prescription.getCreatedAt());
    data.put("patientName", patientName);
    data.put("doctorName", doctorName);
    data.put("doctorCrm", doctorCrm);
    data.put("medicines", prescription.getMedicines());
    data.put("notes", prescription.getNotes() != null ? prescription.getNotes() : "");
    return data;
  }

  private void publishPrescriptionEvent(Prescription prescription) {
    try {
      var itemEvents = prescription.getMedicines().stream()
        .map(item -> new PrescriptionIssuedEvent.PrescriptionItemEvent(
          item.getName(), item.getDosage(), item.getFrequency(), item.getDuration()))
        .toList();

      LocalDate validUntil = prescription.getCreatedAt() != null
        ? prescription.getCreatedAt().toLocalDate().plusDays(30)
        : LocalDate.now().plusDays(30);

      PrescriptionIssuedEvent event = new PrescriptionIssuedEvent(
        prescription.getId(),
        prescription.getAppointment().getPatientId(),
        prescription.getAppointment().getDoctorId(),
        validUntil,
        prescription.getNotes(),
        itemEvents
      );

      rabbitTemplate.convertAndSend(exchange, prescriptionIssuedRoutingKey, event);
    } catch (Exception e) {
      log.error("Erro ao publicar evento de prescrição: {}", e.getMessage());
    }
  }
}