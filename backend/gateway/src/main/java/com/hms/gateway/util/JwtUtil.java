package com.hms.gateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

  @Value("${application.security.jwt.secret-key}")
  private String secretKey;

  // Valida o token JWT. Verifica a assinatura e a data de expiração.
  public void validateToken(final String token) {
    Jwts.parser()
      .verifyWith(getSignInKey())
      .build()
      .parseSignedClaims(token);
  }

  private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}