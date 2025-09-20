package com.hms.appointment.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SchedulingConflictException extends RuntimeException {
  public SchedulingConflictException(String message) {
    super(message);
  }
}
