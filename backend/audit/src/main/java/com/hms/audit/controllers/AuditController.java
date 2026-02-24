package com.hms.audit.controllers;

import com.hms.audit.entities.AuditLog;
import com.hms.audit.repositories.AuditLogRepository;
import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditController {

  private final AuditLogRepository repository;

  @GetMapping
  public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAllLogs(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {

    Page<AuditLog> logs = repository.findAll(
      PageRequest.of(page, size, Sort.by("timestamp").descending())
    );

    return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(logs)));
  }
}