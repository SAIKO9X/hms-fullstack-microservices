package com.hms.common.exceptions;

import org.springframework.http.HttpStatus;

// 409 - Conflito (ex: recurso já existe)
public class ResourceAlreadyExistsException extends HmsBaseException {

  public ResourceAlreadyExistsException(String resource) {
    super(
      String.format("%s já existe", resource),
      HttpStatus.CONFLICT,
      "RESOURCE_ALREADY_EXISTS"
    );
  }

  public ResourceAlreadyExistsException(String resource, Object identifier) {
    super(
      String.format("%s já existe: %s", resource, identifier),
      HttpStatus.CONFLICT,
      "RESOURCE_ALREADY_EXISTS"
    );
  }
}