package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 403 - Acesso negado
public class AccessDeniedException extends HmsBaseException {

  public AccessDeniedException(String message) {
    super(message, HttpStatus.FORBIDDEN, "ACCESS_DENIED");
  }

  public AccessDeniedException() {
    super("Acesso negado", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
  }
}