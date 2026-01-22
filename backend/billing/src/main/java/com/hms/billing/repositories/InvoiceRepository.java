package com.hms.billing.repositories;

import com.hms.billing.entities.Invoice;
import com.hms.billing.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
  List<Invoice> findByPatientId(String patientId);

  List<Invoice> findByDoctorId(String doctorId);

  Optional<Invoice> findByAppointmentId(Long appointmentId);

  List<Invoice> findByStatus(InvoiceStatus status);

  Optional<Invoice> findByPharmacySaleId(Long pharmacySaleId);
}