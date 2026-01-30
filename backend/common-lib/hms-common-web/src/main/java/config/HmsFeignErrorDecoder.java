package config;

import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.common.exceptions.ServiceUnavailableException;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class HmsFeignErrorDecoder implements ErrorDecoder {

  private final ErrorDecoder defaultDecoder = new Default();

  @Override
  public Exception decode(String methodKey, Response response) {
    int status = response.status();
    String serviceName = extractServiceName(methodKey);

    log.warn("Feign error - Service: {}, Method: {}, Status: {}",
      serviceName, methodKey, status);

    return switch (status) {
      case 404 -> new ResourceNotFoundException(
        String.format("Recurso não encontrado no serviço %s", serviceName)
      );
      case 403 -> new AccessDeniedException(
        String.format("Acesso negado pelo serviço %s", serviceName)
      );
      case 503, 504 -> new ServiceUnavailableException(serviceName);
      default -> defaultDecoder.decode(methodKey, response);
    };
  }

  private String extractServiceName(String methodKey) {
    if (methodKey == null || !methodKey.contains("#")) {
      return "Unknown Service";
    }
    return methodKey.substring(0, methodKey.indexOf("#"));
  }
}