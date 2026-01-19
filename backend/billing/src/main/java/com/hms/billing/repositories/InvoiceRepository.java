package com.hms.billing.repositories;

import com.hms.billing.entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
  List<Invoice> findByPatientId(String patientId);

  List<Invoice> findByDoctorId(String doctorId);

  Optional<Invoice> findByAppointmentId(Long appointmentId);
}