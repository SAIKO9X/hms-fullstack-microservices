package com.hms.pharmacy.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class MedicineNotFoundException extends RuntimeException {
  public MedicineNotFoundException(String message) {
    super(message);
  }
}