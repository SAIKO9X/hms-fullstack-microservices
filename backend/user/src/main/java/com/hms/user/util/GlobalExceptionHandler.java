package com.hms.user.util;

import com.hms.user.exceptions.UserAlreadyExistsException;
import com.hms.user.exceptions.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

// Para garantir que as respostas de erro da API sejam padronizadas.
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Captura a exceção UserNotFoundException e retorna uma resposta HTTP 404 (Not Found).
   *
   * @param ex A exceção capturada.
   * @return ResponseEntity contendo os detalhes do erro e o status HTTP.
   */
  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<ErrorInfo> handleUserNotFound(UserNotFoundException ex) {
    ErrorInfo errorInfo = new ErrorInfo(
      (long) HttpStatus.NOT_FOUND.value(),
      ex.getMessage(),
      LocalDateTime.now()
    );
    return new ResponseEntity<>(errorInfo, HttpStatus.NOT_FOUND);
  }

  /**
   * Captura a exceção UserAlreadyExistsException e retorna uma resposta HTTP 409 (Conflict).
   *
   * @param ex A exceção capturada.
   * @return ResponseEntity contendo os detalhes do erro e o status HTTP.
   */
  @ExceptionHandler(UserAlreadyExistsException.class)
  public ResponseEntity<ErrorInfo> handleUserAlreadyExists(UserAlreadyExistsException ex) {
    ErrorInfo errorInfo = new ErrorInfo(
      (long) HttpStatus.CONFLICT.value(),
      ex.getMessage(),
      LocalDateTime.now()
    );
    return new ResponseEntity<>(errorInfo, HttpStatus.CONFLICT);
  }

  /**
   * Captura exceções de validação (ex: @Email, @Size) e retorna HTTP 400 (Bad Request).
   * Concatena todas as mensagens de erro de validação em uma única string.
   *
   * @param ex A exceção de validação capturada.
   * @return ResponseEntity com os detalhes dos erros e o status HTTP.
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorInfo> handleValidationException(MethodArgumentNotValidException ex) {
    String errorMessages = ex.getBindingResult().getFieldErrors().stream()
      .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
      .collect(Collectors.joining(", "));

    ErrorInfo errorInfo = new ErrorInfo(
      (long) HttpStatus.BAD_REQUEST.value(),
      errorMessages,
      LocalDateTime.now()
    );
    return new ResponseEntity<>(errorInfo, HttpStatus.BAD_REQUEST);
  }

  /**
   * Captura qualquer outra exceção não tratada e retorna um HTTP 500 (Internal Server Error).
   * Isso evita que stack traces vazem para o cliente.
   *
   * @param ex A exceção genérica capturada.
   * @return ResponseEntity com uma mensagem de erro genérica e o status HTTP.
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorInfo> handleGenericException(Exception ex) {
    ex.printStackTrace();

    ErrorInfo errorInfo = new ErrorInfo(
      (long) HttpStatus.INTERNAL_SERVER_ERROR.value(),
      "Erro interno no servidor: " + ex.getMessage(),
      LocalDateTime.now()
    );
    return new ResponseEntity<>(errorInfo, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorInfo> handleIllegalArgumentException(IllegalArgumentException ex) {
    return new ResponseEntity<>(
      new ErrorInfo(
        (long) HttpStatus.BAD_REQUEST.value(),
        ex.getMessage(),
        LocalDateTime.now()
      ),
      HttpStatus.BAD_REQUEST
    );
  }
}