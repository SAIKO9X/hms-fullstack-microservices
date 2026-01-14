package com.hms.user.services;

import com.hms.user.entities.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

  @Value("${application.security.jwt.secret-key}")
  private String secretKey;

  @Value("${application.security.jwt.expiration}")
  private long jwtExpiration;

  // gera um token JWT com claims
  public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    claims.put("fullName", user.getName());
    claims.put("role", user.getRole().name());

    return buildToken(claims, user.getEmail());
  }

  // retorna o tempo de expiração do token configurado na aplicação.
  public long getExpirationTime() {
    return jwtExpiration;
  }

  // constrói o token JWT com os claims, subject e define a expiração.
  private String buildToken(Map<String, Object> extraClaims, String subject) {
    return Jwts.builder()
      .claims(extraClaims)
      .subject(subject)
      .issuedAt(new Date(System.currentTimeMillis()))
      .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
      .signWith(getSignInKey())
      .compact();
  }

  // gera a (SecretKey) a partir da string Base64 no application.yml.
  private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}