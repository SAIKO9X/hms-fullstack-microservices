package aspect;

import com.hms.common.audit.AuditChangeTracker;
import com.hms.common.dto.event.AuditLogEvent;
import com.hms.common.security.Auditable;
import com.hms.common.security.HmsUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

  private final RabbitTemplate rabbitTemplate;

  // Cenário de Sucesso
  @AfterReturning(value = "@annotation(auditable)", returning = "result")
  public void logAuditActivity(JoinPoint joinPoint, Auditable auditable, Object result) {
    recordAudit(joinPoint, auditable, "SUCCESS", null);
  }

  // Cenário de Falha
  @AfterThrowing(value = "@annotation(auditable)", throwing = "ex")
  public void logAuditException(JoinPoint joinPoint, Auditable auditable, Throwable ex) {
    recordAudit(joinPoint, auditable, "FAILURE", ex.getMessage());
  }

  private void recordAudit(JoinPoint joinPoint, Auditable auditable, String status, String errorMessage) {
    try {
      Long actorIdLong = getCurrentUserId();
      String actorId = actorIdLong != null ? String.valueOf(actorIdLong) : "SYSTEM";
      String actorRole = getCurrentUserRole();

      String ipAddress = getClientIp();
      String details = buildDetails(joinPoint.getArgs(), status, errorMessage);

      AuditLogEvent event = new AuditLogEvent(
        actorId,
        actorRole,
        auditable.action(),
        auditable.resourceName(),
        null,
        details,
        ipAddress,
        LocalDateTime.now()
      );

      rabbitTemplate.convertAndSend("audit.exchange", "audit.routing.key", event);

      log.info("Audit log sent: Action={}, User={}, Status={}", auditable.action(), actorId, status);

    } catch (Exception e) {
      log.error("Failed to send audit log", e);
    } finally {
      AuditChangeTracker.clear();
    }
  }

  // Constrói os detalhes do log de auditoria
  private String buildDetails(Object[] args, String status, String errorMessage) {
    StringBuilder detailsBuilder = new StringBuilder();

    if ("FAILURE".equals(status)) {
      detailsBuilder.append("Failed: ").append(errorMessage);
    } else {
      detailsBuilder.append("Success");
    }

    Map<String, AuditChangeTracker.ChangeDetail> changes = AuditChangeTracker.getChanges();
    if (!changes.isEmpty()) {
      detailsBuilder.append(". Changes: [");
      changes.forEach((field, change) ->
        detailsBuilder.append(String.format("{field: '%s', from: '%s', to: '%s'}, ",
          field, change.oldValue(), change.newValue()))
      );
      if (detailsBuilder.toString().endsWith(", ")) {
        detailsBuilder.setLength(detailsBuilder.length() - 2);
      }
      detailsBuilder.append("]");
    }

    if (args != null && args.length > 0) {
      String argsString = Arrays.stream(args)
        .filter(arg -> !(arg instanceof HttpServletRequest))
        .filter(arg -> !(arg instanceof HttpServletResponse))
        .filter(arg -> !(arg instanceof Authentication))
        .filter(arg -> !(arg instanceof BindingResult))
        .filter(Objects::nonNull)
        .map(Object::toString)
        .collect(Collectors.joining(", "));

      // limita o tamanho para não estourar banco de dados se houver um PDF em base64
      if (argsString.length() > 500) {
        argsString = argsString.substring(0, 500) + "...";
      }
      detailsBuilder.append(". Args: [").append(argsString).append("]");
    }

    return detailsBuilder.toString();
  }

  // btém o papel (role) do usuário atual
  private String getCurrentUserRole() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
      return authentication.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .findFirst()
        .orElse("UNKNOWN");
    }
    return "SYSTEM";
  }

  private Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof HmsUserPrincipal userPrincipal) {
      return userPrincipal.getId();
    }
    return null; // Sistema ou Anônimo
  }

  private String getClientIp() {
    try {
      ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      if (attributes != null) {
        HttpServletRequest request = attributes.getRequest();
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
          return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
      }
    } catch (Exception e) {
      // Ignora em contextos assíncronos
    }
    return "Unknown";
  }
}