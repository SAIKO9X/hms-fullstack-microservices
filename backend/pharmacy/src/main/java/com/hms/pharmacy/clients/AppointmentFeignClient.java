package com.hms.pharmacy.clients;

import com.hms.pharmacy.request.PrescriptionReceiveRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "appointment-service", path = "/prescriptions")
public interface AppointmentFeignClient {

    @GetMapping("/{id}/for-pharmacy")
    PrescriptionReceiveRequest getPrescriptionForPharmacy(@PathVariable("id") Long id);
}