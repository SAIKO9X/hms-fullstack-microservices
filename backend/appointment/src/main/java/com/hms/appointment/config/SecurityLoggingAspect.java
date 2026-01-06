package com.hms.appointment.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class SecurityLoggingAspect {

  @Around("@annotation(org.springframework.security.access.prepost.PreAuthorize)")
  public Object logSecurityCheck(ProceedingJoinPoint joinPoint) throws Throwable {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    log.info("========== SECURITY CHECK ==========");
    log.info("Method: {}", joinPoint.getSignature().getName());
    log.info("Authentication exists: {}", auth != null);

    if (auth != null) {
      log.info("Principal: {}", auth.getPrincipal());
      log.info("Authorities: {}", auth.getAuthorities());
      log.info("Is Authenticated: {}", auth.isAuthenticated());
      log.info("Details: {}", auth.getDetails());
    }

    try {
      Object result = joinPoint.proceed();
      log.info("✅ Security check PASSED");
      return result;
    } catch (Exception e) {
      log.error("❌ Security check FAILED: {}", e.getMessage());
      throw e;
    }
  }
}