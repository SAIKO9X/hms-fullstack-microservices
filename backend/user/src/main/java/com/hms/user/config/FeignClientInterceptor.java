package com.hms.user.config;

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
    // Tenta obter os atributos da requisição atual
    ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

    if (attributes != null) {
      HttpServletRequest request = attributes.getRequest();
      // Obtém o cabeçalho de autorização da requisição original
      String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

      // Se o cabeçalho existir, anexa-o à nova requisição do Feign
      if (authorizationHeader != null && !authorizationHeader.isEmpty()) {
        template.header(AUTHORIZATION_HEADER, authorizationHeader);
      }
    }
  }
}