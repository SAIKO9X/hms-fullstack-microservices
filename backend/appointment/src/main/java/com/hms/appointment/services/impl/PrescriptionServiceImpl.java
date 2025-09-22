package com.hms.appointment.services.impl;

import com.hms.appointment.entities.Appointment;
import com.hms.appointment.entities.Medicine;
import com.hms.appointment.entities.Prescription;
import com.hms.appointment.exceptions.AppointmentNotFoundException;
import com.hms.appointment.exceptions.InvalidUpdateException;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.PrescriptionRepository;
import com.hms.appointment.request.MedicineRequest;
import com.hms.appointment.request.PrescriptionCreateRequest;
import com.hms.appointment.request.PrescriptionUpdateRequest;
import com.hms.appointment.response.PrescriptionResponse;
import com.hms.appointment.services.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

  private final PrescriptionRepository prescriptionRepository;
  private final AppointmentRepository appointmentRepository;

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

    return PrescriptionResponse.fromEntity(prescriptionRepository.save(newPrescription));
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterId) {
    Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
      .orElseThrow(() -> new AppointmentNotFoundException("Prescrição não encontrada para a consulta com ID: " + appointmentId));

    Appointment appointment = prescription.getAppointment();
    if (!appointment.getDoctorId().equals(requesterId) && !appointment.getPatientId().equals(requesterId)) {
      throw new SecurityException("Acesso negado. Você não tem permissão para ver esta prescrição.");
    }

    return PrescriptionResponse.fromEntity(prescription);
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
}