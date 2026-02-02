package com.hms.common.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.List;

@Slf4j
public class FeignClientInterceptor implements RequestInterceptor {

  private static final List<String> HEADERS_TO_PROPAGATE = Arrays.asList(
    "Authorization",
    "X-Correlation-ID",
    "X-Request-ID",
    "X-User-ID",
    "X-Tenant-ID"
  );

  @Override
  public void apply(RequestTemplate template) {
    ServletRequestAttributes attributes = getRequestAttributes();

    if (attributes == null) {
      log.debug("No request context available - skipping header propagation");
      return;
    }

    HttpServletRequest request = attributes.getRequest();
    propagateHeaders(request, template);
  }

  // obtém os atributos da requisição atual, se disponíveis
  private ServletRequestAttributes getRequestAttributes() {
    try {
      return (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    } catch (IllegalStateException e) {
      // contexto não disponível (ex: chamada assíncrona)
      log.trace("Request context not available: {}", e.getMessage());
      return null;
    }
  }

  // propaga os headers definidos para a requisição Feign
  private void propagateHeaders(HttpServletRequest request, RequestTemplate template) {
    HEADERS_TO_PROPAGATE.forEach(headerName -> {
      String headerValue = request.getHeader(headerName);

      if (headerValue != null && !headerValue.isBlank()) {
        template.header(headerName, headerValue);
        log.trace("Propagating header '{}' to Feign request", headerName);
      }
    });
  }
}