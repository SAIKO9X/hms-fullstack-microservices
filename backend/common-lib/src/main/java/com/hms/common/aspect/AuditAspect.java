package com.hms.common.aspect;

import com.hms.common.dto.AuditLogEvent;
import com.hms.common.security.Auditable;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

  private final RabbitTemplate rabbitTemplate;

  private static final String AUDIT_EXCHANGE = "hms.audit.exchange";
  private static final String AUDIT_ROUTING_KEY = "audit.log";

  @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
  public void logAudit(JoinPoint joinPoint, Auditable auditable, Object result) {
    try {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth == null || !auth.isAuthenticated()) {
        return; // não audita chamadas anônimas (ou loga como ANONYMOUS)
      }

      String resourceId = extractResourceId(joinPoint);
      String ipAddress = getClientIp();

      AuditLogEvent event = new AuditLogEvent(
        auth.getName(),
        auth.getAuthorities().toString(),
        auditable.action(),
        auditable.resourceName(),
        resourceId,
        "Success",
        ipAddress,
        LocalDateTime.now()
      );

      rabbitTemplate.convertAndSend(AUDIT_EXCHANGE, AUDIT_ROUTING_KEY, event);

      log.info("Audit event sent: {} on {}", auditable.action(), auditable.resourceName());

    } catch (Exception e) {
      log.error("Failed to generate audit log", e);
    }
  }

  private String extractResourceId(JoinPoint joinPoint) {
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    String[] parameterNames = signature.getParameterNames();
    Object[] args = joinPoint.getArgs();

    if (args == null || args.length == 0) return "N/A";

    // tenta achar um parametro chamado "id", "doctorId", "patientId"
    for (int i = 0; i < parameterNames.length; i++) {
      String name = parameterNames[i].toLowerCase();
      if (name.contains("id") && args[i] != null) {
        return args[i].toString();
      }
    }

    // se não achar pelo nome, assume que o primeiro argumento é relevante se for String/Long
    if (args[0] instanceof String || args[0] instanceof Long) {
      return args[0].toString();
    }

    return "UNKNOWN";
  }

  private String getClientIp() {
    try {
      ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      if (attrs != null) {
        HttpServletRequest request = attrs.getRequest();
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
          return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
      }
    } catch (Exception e) {
      // ignora erros ao obter IP
    }
    return "UNKNOWN";
  }
}