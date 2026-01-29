package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 400 - Operação inválida/ilegal
public class InvalidOperationException extends HmsBaseException {

  public InvalidOperationException(String message) {
    super(message, HttpStatus.BAD_REQUEST, "INVALID_OPERATION");
  }

  public InvalidOperationException(String message, Throwable cause) {
    super(message, cause, HttpStatus.BAD_REQUEST, "INVALID_OPERATION");
  }
}