package com.hms.appointment.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignClientInterceptor implements RequestInterceptor {

  private static final String AUTHORIZATION_HEADER = "Authorization";

  @Override
  public void apply(RequestTemplate template) {
    ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attributes != null) {
      HttpServletRequest request = attributes.getRequest();
      String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);
      if (authorizationHeader != null) {
        // Propaga o cabeçalho de autorização da requisição original para a requisição do Feign.
        template.header(AUTHORIZATION_HEADER, authorizationHeader);
      }
    }
  }
}