package com.hms.gateway.util;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilTest {

  private JwtUtil jwtUtil;

  // chave simulada codificada em base64
  private final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

  @BeforeEach
  void setUp() {
    jwtUtil = new JwtUtil();
    // injeta a secret na propriedade privada antes de cada teste, simulando o @Value do Spring
    ReflectionTestUtils.setField(jwtUtil, "secretKey", TEST_SECRET);
  }

  // Método auxiliar para gerar tokens de teste
  private String generateTestToken(long expirationMillis) {
    byte[] keyBytes = Decoders.BASE64.decode(TEST_SECRET);
    SecretKey key = Keys.hmacShaKeyFor(keyBytes);

    return Jwts.builder()
      .subject("usuario@teste.com")
      .issuedAt(new Date(System.currentTimeMillis()))
      .expiration(new Date(System.currentTimeMillis() + expirationMillis))
      .signWith(key)
      .compact();
  }

  @Test
  @DisplayName("Deve validar o token com sucesso sem lançar exceções se a assinatura e validade estiverem corretas")
  void validateToken_WithValidToken_ShouldPass() {
    String validToken = generateTestToken(1000 * 60 * 60);

    // se for válido, a função executa silenciosamente (void) sem disparar Exceptions
    assertDoesNotThrow(() -> jwtUtil.validateToken(validToken));
  }

  @Test
  @DisplayName("Deve lançar exceção ao tentar validar um token com a assinatura adulterada")
  void validateToken_WithModifiedToken_ShouldThrowException() {
    String validToken = generateTestToken(1000 * 60 * 60);
    String tamperedToken = validToken + "xyz"; // adulterando a string do token

    assertThrows(Exception.class, () -> jwtUtil.validateToken(tamperedToken));
  }

  @Test
  @DisplayName("Deve lançar ExpiredJwtException ao tentar validar um token cuja data já expirou")
  void validateToken_WithExpiredToken_ShouldThrowException() {
    String expiredToken = generateTestToken(-10000); // expirou 10 segundos no passado

    assertThrows(ExpiredJwtException.class, () -> jwtUtil.validateToken(expiredToken));
  }
}