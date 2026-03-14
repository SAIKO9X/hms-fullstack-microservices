package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 401 - Não autorizado (Token expirado, inválido ou revogado)
public class InvalidTokenException extends HmsBaseException {

  public InvalidTokenException(String message) {
    super(message, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
  }

  public InvalidTokenException(String message, Throwable cause) {
    super(message, cause, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
  }
}