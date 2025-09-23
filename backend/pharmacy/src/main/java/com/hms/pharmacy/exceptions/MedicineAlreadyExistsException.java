package com.hms.pharmacy.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class MedicineAlreadyExistsException extends RuntimeException {
  public MedicineAlreadyExistsException(String message) {
    super(message);
  }
}