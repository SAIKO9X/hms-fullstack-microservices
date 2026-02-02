package com.hms.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

// detalhes de erro para respostas de API
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorDetails(
  Integer code,
  String type,
  Map<String, String> validationErrors
) {

  public static ErrorDetails of(int code, String type) {
    return new ErrorDetails(code, type, null);
  }

  public static ErrorDetails validation(Map<String, String> errors) {
    return new ErrorDetails(400, "VALIDATION_ERROR", errors);
  }
}