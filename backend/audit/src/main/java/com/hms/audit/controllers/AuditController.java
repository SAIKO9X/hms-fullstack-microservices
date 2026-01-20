package com.hms.audit.controllers;

import com.hms.audit.entities.AuditLog;
import com.hms.audit.repositories.AuditLogRepository;
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
  public ResponseEntity<Page<AuditLog>> getAllLogs(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
  ) {
    PageRequest pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
    return ResponseEntity.ok(repository.findAll(pageable));
  }

  // futuramente adicionar filtros por data/usuário
}