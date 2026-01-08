package com.hms.appointment.services.impl;

import com.hms.appointment.dto.event.PrescriptionIssuedEvent;
import com.hms.appointment.dto.request.MedicineRequest;
import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.Medicine;
import com.hms.appointment.entities.Prescription;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.PrescriptionRepository;
import com.hms.appointment.services.PrescriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

  private final PrescriptionRepository prescriptionRepository;
  private final AppointmentRepository appointmentRepository;
  private final RabbitTemplate rabbitTemplate;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.prescription-issued-routing-key}")
  private String prescriptionIssuedRoutingKey;

  @Override
  @Transactional
  public PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId) {
    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new AppointmentNotFoundException("Consulta com ID " + request.appointmentId() + " não encontrada."));

    if (!appointment.getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado. Apenas o médico responsável pode criar uma prescrição.");
    }

    if (prescriptionRepository.findByAppointmentId(request.appointmentId()).isPresent()) {
      throw new InvalidUpdateException("Uma prescrição para esta consulta já existe.");
    }

    Prescription newPrescription = new Prescription();
    newPrescription.setAppointment(appointment);
    newPrescription.setNotes(request.notes());

    List<Medicine> medicines = mapToMedicineEntities(request.medicines());
    newPrescription.setMedicines(medicines);

    Prescription savedPrescription = prescriptionRepository.save(newPrescription);

    publishPrescriptionEvent(savedPrescription);

    return PrescriptionResponse.fromEntity(savedPrescription);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId) {
    return prescriptionRepository.findByAppointmentId(appointmentId)
      .map(prescription -> {
        // Validação de segurança
        Appointment appointment = prescription.getAppointment();
        if (!appointment.getDoctorId().equals(requesterId) && !appointment.getPatientId().equals(requesterId)) {
          throw new SecurityException("Acesso negado. Você não tem permissão para ver esta prescrição.");
        }
        return PrescriptionResponse.fromEntity(prescription);
      })
      .orElse(null);
  }

  @Override
  @Transactional
  public PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long doctorId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new AppointmentNotFoundException("Prescrição com ID " + prescriptionId + " não encontrada."));

    if (!prescription.getAppointment().getDoctorId().equals(doctorId)) {
      throw new SecurityException("Acesso negado. Apenas o médico responsável pode editar esta prescrição.");
    }

    List<Medicine> updatedMedicines = mapToMedicineEntities(request.medicines());

    // Usa o método setMedicines para limpar a lista antiga e adicionar a nova
    prescription.setMedicines(updatedMedicines);
    prescription.setNotes(request.notes());

    return PrescriptionResponse.fromEntity(prescriptionRepository.save(prescription));
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PrescriptionResponse> getPrescriptionsByPatientId(Long patientId, Long requesterId, Pageable pageable) {
    // Validação de segurança: apenas o próprio paciente ou um médico pode ver
    List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
    boolean isAuthorized = appointments.stream()
      .anyMatch(app -> app.getPatientId().equals(requesterId) || app.getDoctorId().equals(requesterId));

    return prescriptionRepository.findByAppointmentPatientId(patientId, pageable)
      .map(PrescriptionResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionForPharmacyResponse getPrescriptionForPharmacy(Long prescriptionId) {
    return prescriptionRepository.findById(prescriptionId)
      .map(PrescriptionForPharmacyResponse::fromEntity)
      .orElseThrow(() -> new AppointmentNotFoundException("Prescrição com ID " + prescriptionId + " não encontrada."));
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getLatestPrescriptionByPatientId(Long patientId) {
    return prescriptionRepository.findFirstByAppointmentPatientIdOrderByCreatedAtDesc(patientId)
      .map(PrescriptionResponse::fromEntity)
      .orElse(null);
  }

  private List<Medicine> mapToMedicineEntities(List<MedicineRequest> medicineRequests) {
    return medicineRequests.stream().map(dto -> {
      Medicine med = new Medicine();
      med.setName(dto.name());
      med.setDosage(dto.dosage());
      med.setFrequency(dto.frequency());
      med.setDuration(dto.duration());
      return med;
    }).collect(Collectors.toList());
  }

  private void publishPrescriptionEvent(Prescription prescription) {
    try {
      List<Medicine> medicines = prescription.getMedicines() != null ? prescription.getMedicines() : List.of();

      // Medicines -> Event Items
      List<PrescriptionIssuedEvent.PrescriptionItemEvent> itemEvents = medicines.stream()
        .map(item -> new PrescriptionIssuedEvent.PrescriptionItemEvent(
          item.getName(),
          item.getDosage(),
          item.getFrequency(),
          item.getDuration()
        )).toList();

      // Validade (Lógica de Negócio: Data da criação + 30 dias)
      java.time.LocalDate validUntilDate = (prescription.getCreatedAt() != null)
        ? prescription.getCreatedAt().toLocalDate().plusDays(30)
        : java.time.LocalDate.now().plusDays(30);

      PrescriptionIssuedEvent event = new PrescriptionIssuedEvent(
        prescription.getId(),
        prescription.getAppointment().getPatientId(),
        prescription.getAppointment().getDoctorId(),
        validUntilDate,
        prescription.getNotes(),
        itemEvents
      );

      rabbitTemplate.convertAndSend(exchange, prescriptionIssuedRoutingKey, event);
      log.info("Evento de prescrição emitida enviado para fila: Prescription ID {}", prescription.getId());

    } catch (Exception e) {
      log.error("Erro ao enviar evento de prescrição para o RabbitMQ", e);
    }
  }
}