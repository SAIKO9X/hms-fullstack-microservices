package com.hms.user.services;

import com.hms.user.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

  @Value("${application.security.jwt.secret-key}")
  private String secretKey;

  @Value("${application.security.jwt.expiration}")
  private long jwtExpiration;


  // Gera um token JWT com claims customizados a partir da entidade User.
  public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    claims.put("fullName", user.getName());
    claims.put("role", user.getRole().name());

    return buildToken(claims, user.getEmail());
  }

  // Valida um token JWT verificando o username e a data de expiração.
  public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
  }

  // Extrai o username (subject) de um token JWT.
  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  // Extrai um claim específico de um token usando uma função resolver.
  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  // Retorna o tempo de expiração do token configurado na aplicação.
  public long getExpirationTime() {
    return jwtExpiration;
  }

  // Constrói o token JWT com os claims, subject e define a expiração.
  private String buildToken(Map<String, Object> extraClaims, String subject) {
    return Jwts.builder()
      .claims(extraClaims)
      .subject(subject)
      .issuedAt(new Date(System.currentTimeMillis()))
      .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
      .signWith(getSignInKey())
      .compact();
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  // Extrai a data de expiração de um token.
  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  // Extrai todos os claims de um token usando a chave de assinatura.
  private Claims extractAllClaims(String token) {
    return Jwts.parser()
      .verifyWith(getSignInKey())
      .build()
      .parseSignedClaims(token)
      .getPayload();
  }

  // Gera a (SecretKey) a partir da string Base64 no application.yml.
  private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}