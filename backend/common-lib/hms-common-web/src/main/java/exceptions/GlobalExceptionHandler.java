package exceptions;

import com.hms.common.dto.response.ApiResponse;
import com.hms.common.dto.response.ErrorDetails;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


  // Trata todas as exceções que estendem HmsBaseException
  @ExceptionHandler(HmsBaseException.class)
  public ResponseEntity<ApiResponse<Void>> handleHmsBaseException(HmsBaseException ex) {
    log.warn("HMS Exception [{}]: {}", ex.getErrorCode(), ex.getMessage());

    ErrorDetails errorDetails = new ErrorDetails(
      ex.getHttpStatus().value(),
      ex.getErrorCode(),
      null
    );

    ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), errorDetails);

    return ResponseEntity
      .status(ex.getHttpStatus())
      .body(response);
  }

  // Trata erros de validação do @Valid
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidationException(
    MethodArgumentNotValidException ex
  ) {
    Map<String, String> errors = new HashMap<>();

    ex.getBindingResult().getAllErrors().forEach(error -> {
      String fieldName = ((FieldError) error).getField();
      String errorMessage = error.getDefaultMessage();
      errors.put(fieldName, errorMessage);
    });

    log.warn("Validation error: {}", errors);

    ErrorDetails errorDetails = ErrorDetails.validation(errors);
    ApiResponse<Void> response = ApiResponse.error(
      "Erro de validação nos dados enviados",
      errorDetails
    );

    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(response);
  }

  // Trata erros de validação de constraints (@NotNull, @Size, etc)
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
    ConstraintViolationException ex
  ) {
    Map<String, String> errors = new HashMap<>();

    ex.getConstraintViolations().forEach(violation -> {
      String propertyPath = violation.getPropertyPath().toString();
      String message = violation.getMessage();
      errors.put(propertyPath, message);
    });

    log.warn("Constraint violation: {}", errors);

    ErrorDetails errorDetails = ErrorDetails.validation(errors);
    ApiResponse<Void> response = ApiResponse.error(
      "Violação de restrição nos dados",
      errorDetails
    );

    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(response);
  }

  // Trata JSON malformado ou tipo incompatível
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
    HttpMessageNotReadableException ex
  ) {
    log.warn("Malformed JSON request: {}", ex.getMessage());

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.BAD_REQUEST.value(),
      "MALFORMED_JSON"
    );

    ApiResponse<Void> response = ApiResponse.error(
      "Formato de dados inválido. Verifique o JSON enviado.",
      errorDetails
    );

    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(response);
  }

  // Trata parâmetros obrigatórios ausentes
  @ExceptionHandler(MissingServletRequestParameterException.class)
  public ResponseEntity<ApiResponse<Void>> handleMissingParams(
    MissingServletRequestParameterException ex
  ) {
    log.warn("Missing request parameter: {}", ex.getParameterName());

    String message = String.format(
      "Parâmetro obrigatório ausente: '%s'",
      ex.getParameterName()
    );

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.BAD_REQUEST.value(),
      "MISSING_PARAMETER"
    );

    ApiResponse<Void> response = ApiResponse.error(message, errorDetails);

    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(response);
  }

  // Trata erro de tipo de argumento (ex: String onde deveria ser Long)
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
    MethodArgumentTypeMismatchException ex
  ) {
    log.warn("Type mismatch for parameter '{}': expected {}, got {}",
      ex.getName(), ex.getRequiredType(), ex.getValue());

    String message = String.format(
      "Tipo de dado inválido para '%s'. Esperado: %s",
      ex.getName(),
      ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"
    );

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.BAD_REQUEST.value(),
      "TYPE_MISMATCH"
    );

    ApiResponse<Void> response = ApiResponse.error(message, errorDetails);

    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(response);
  }

  // Trata rota não encontrada (404)
  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleNoHandlerFound(
    NoHandlerFoundException ex
  ) {
    log.warn("No handler found for {} {}", ex.getHttpMethod(), ex.getRequestURL());

    String message = String.format(
      "Rota não encontrada: %s %s",
      ex.getHttpMethod(),
      ex.getRequestURL()
    );

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.NOT_FOUND.value(),
      "ROUTE_NOT_FOUND"
    );

    ApiResponse<Void> response = ApiResponse.error(message, errorDetails);

    return ResponseEntity
      .status(HttpStatus.NOT_FOUND)
      .body(response);
  }

  // Trata IllegalArgumentException
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(
    IllegalArgumentException ex
  ) {
    log.warn("Illegal argument: {}", ex.getMessage());

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.BAD_REQUEST.value(),
      "ILLEGAL_ARGUMENT"
    );

    ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), errorDetails);

    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(response);
  }

  // Trata IllegalStateException
  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ApiResponse<Void>> handleIllegalState(
    IllegalStateException ex
  ) {
    log.warn("Illegal state: {}", ex.getMessage());

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.CONFLICT.value(),
      "ILLEGAL_STATE"
    );

    ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), errorDetails);

    return ResponseEntity
      .status(HttpStatus.CONFLICT)
      .body(response);
  }

  // Fallback para qualquer exceção não tratada
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
    log.error("Unhandled exception", ex);

    ErrorDetails errorDetails = ErrorDetails.of(
      HttpStatus.INTERNAL_SERVER_ERROR.value(),
      "INTERNAL_ERROR"
    );

    // em produção, não expõe detalhes internos
    String message = "Erro interno do servidor. Por favor, tente novamente mais tarde.";

    ApiResponse<Void> response = ApiResponse.error(message, errorDetails);

    return ResponseEntity
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(response);
  }
}