package com.hms.audit.repositories;

import com.hms.audit.entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
  List<AuditLog> findByActorIdOrderByTimestampDesc(String actorId);

  List<AuditLog> findByResourceIdOrderByTimestampDesc(String resourceId);
}