package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends HmsBaseException {
  public InvalidCredentialsException() {
    super("Email ou senha inválidos", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
  }
}