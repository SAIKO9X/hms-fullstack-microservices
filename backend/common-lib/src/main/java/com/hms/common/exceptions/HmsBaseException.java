package com.hms.common.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class HmsBaseException extends RuntimeException {

  private final HttpStatus httpStatus;
  private final String errorCode;

  protected HmsBaseException(String message, HttpStatus httpStatus, String errorCode) {
    super(message);
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
  }

  protected HmsBaseException(String message, Throwable cause, HttpStatus httpStatus, String errorCode) {
    super(message, cause);
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
  }

}