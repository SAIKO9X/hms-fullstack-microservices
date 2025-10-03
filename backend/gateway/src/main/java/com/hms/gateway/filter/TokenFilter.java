package com.hms.gateway.filter;

import com.hms.gateway.utilities.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Component
public class TokenFilter extends AbstractGatewayFilterFactory<TokenFilter.Config> {

  private final RouteValidator validator;
  private final JwtUtil jwtUtil;

  public TokenFilter(RouteValidator validator, JwtUtil jwtUtil) {
    super(Config.class);
    this.validator = validator;
    this.jwtUtil = jwtUtil;
  }

  @Override
  public GatewayFilter apply(Config config) {
    return ((exchange, chain) -> {
      // Verifica se a rota é pública (não precisa de token)
      if (validator.isSecured.test(exchange.getRequest())) {
        // Se a rota não é pública, verifica se o cabeçalho de autorização existe
        if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
          return onError(exchange);
        }

        String authHeader = Objects.requireNonNull(exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION)).get(0);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
          authHeader = authHeader.substring(7);
        }

        try {
          // Valida o token usando a classe utilitária
          jwtUtil.validateToken(authHeader);
        } catch (Exception e) {
          System.out.println("Token inválido... " + e.getMessage());
          return onError(exchange);
        }
      }
      return chain.filter(exchange);
    });
  }

  private Mono<Void> onError(ServerWebExchange exchange) {
    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
    return exchange.getResponse().setComplete();
  }

  public static class Config {
    // Classe de configuração vazia, necessária para a factory
  }
}