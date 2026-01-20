package com.hms.appointment.controllers;

import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.entities.LabOrder;
import com.hms.appointment.services.LabOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments/lab-orders")
@RequiredArgsConstructor
public class LabOrderController {

  private final LabOrderService labOrderService;

  @PostMapping
  public ResponseEntity<LabOrder> createLabOrder(@RequestBody LabOrderCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(labOrderService.createLabOrder(request));
  }

  @GetMapping("/{appointmentId}")
  public ResponseEntity<List<LabOrder>> getOrdersByAppointment(@PathVariable Long appointmentId) {
    return ResponseEntity.ok(labOrderService.getLabOrdersByAppointment(appointmentId));
  }


}