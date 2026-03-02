package com.hms.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResponseWrapper<T>(
  boolean success,
  String message,
  T data,
  LocalDateTime timestamp,
  ErrorDetails error
) {

  // sucesso com dados
  public static <T> ResponseWrapper<T> success(T data) {
    return ResponseWrapper.<T>builder()
      .success(true)
      .data(data)
      .timestamp(LocalDateTime.now())
      .build();
  }

  // sucesso com dados e mensagem customizada
  public static <T> ResponseWrapper<T> success(T data, String message) {
    return ResponseWrapper.<T>builder()
      .success(true)
      .message(message)
      .data(data)
      .timestamp(LocalDateTime.now())
      .build();
  }

  // sucesso sem dados, apenas mensagem
  public static <T> ResponseWrapper<T> success(String message) {
    return ResponseWrapper.<T>builder()
      .success(true)
      .message(message)
      .timestamp(LocalDateTime.now())
      .build();
  }

  // resposta de erro simples
  public static <T> ResponseWrapper<T> error(String message) {
    return ResponseWrapper.<T>builder()
      .success(false)
      .message(message)
      .timestamp(LocalDateTime.now())
      .build();
  }

  // resposta de erro com detalhes
  public static <T> ResponseWrapper<T> error(String message, ErrorDetails errorDetails) {
    return ResponseWrapper.<T>builder()
      .success(false)
      .message(message)
      .error(errorDetails)
      .timestamp(LocalDateTime.now())
      .build();
  }

  // resposta de erro com código de status
  public static <T> ResponseWrapper<T> error(String message, int statusCode) {
    return ResponseWrapper.<T>builder()
      .success(false)
      .message(message)
      .error(new ErrorDetails(statusCode, null, null))
      .timestamp(LocalDateTime.now())
      .build();
  }
}