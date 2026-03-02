package com.hms.appointment.controllers;

import com.hms.appointment.docs.LabOrderControllerDocs;
import com.hms.appointment.dto.request.AddLabResultRequest;
import com.hms.appointment.dto.request.LabOrderCreateRequest;
import com.hms.appointment.dto.response.LabOrderDTO;
import com.hms.appointment.entities.LabOrder;
import com.hms.appointment.services.LabOrderService;
import com.hms.common.dto.response.ResponseWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appointments/lab-orders")
public class LabOrderController implements LabOrderControllerDocs {

  private final LabOrderService labOrderService;

  @PostMapping
  public ResponseEntity<ResponseWrapper<LabOrder>> createLabOrder(@RequestBody LabOrderCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(ResponseWrapper.success(labOrderService.createLabOrder(request), "Pedido de exame criado."));
  }

  @GetMapping("/{appointmentId}")
  public ResponseEntity<ResponseWrapper<List<LabOrder>>> getOrdersByAppointment(@PathVariable Long appointmentId) {
    return ResponseEntity.ok(ResponseWrapper.success(labOrderService.getLabOrdersByAppointment(appointmentId)));
  }

  @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN', 'DOCTOR')")
  @PatchMapping("/{orderId}/items/{itemId}/results")
  public ResponseEntity<ResponseWrapper<LabOrderDTO>> addResultToItem(
    @PathVariable Long orderId,
    @PathVariable Long itemId,
    @RequestBody AddLabResultRequest request
  ) {
    return ResponseEntity.ok(ResponseWrapper.success(labOrderService.addResultToItem(orderId, itemId, request)));
  }
}