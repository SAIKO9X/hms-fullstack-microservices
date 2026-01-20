package com.hms.common.dto;

import java.time.LocalDateTime;

public record AuditLogEvent(
  String actorId,
  String actorRole, // DOCTOR, ADMIN, PATIENT
  String action,
  String resourceName,
  String resourceId,
  String details,
  String ipAddress,
  LocalDateTime timestamp
) {
}