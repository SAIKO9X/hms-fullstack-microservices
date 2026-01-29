package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 404 - Recurso não encontrado
public class ResourceNotFoundException extends HmsBaseException {

  public ResourceNotFoundException(String resource, Object identifier) {
    super(
      String.format("%s não encontrado: %s", resource, identifier),
      HttpStatus.NOT_FOUND,
      "RESOURCE_NOT_FOUND"
    );
  }

  public ResourceNotFoundException(String message) {
    super(message, HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
  }
}