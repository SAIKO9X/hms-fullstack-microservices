package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 503 - Serviço externo indisponível
public class ServiceUnavailableException extends HmsBaseException {

  public ServiceUnavailableException(String serviceName) {
    super(
      String.format("Serviço %s temporariamente indisponível", serviceName),
      HttpStatus.SERVICE_UNAVAILABLE,
      "SERVICE_UNAVAILABLE"
    );
  }

  public ServiceUnavailableException(String serviceName, Throwable cause) {
    super(
      String.format("Serviço %s temporariamente indisponível", serviceName),
      cause,
      HttpStatus.SERVICE_UNAVAILABLE,
      "SERVICE_UNAVAILABLE"
    );
  }
}