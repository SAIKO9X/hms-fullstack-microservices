package com.hms.user.services.impl;

import com.hms.common.exceptions.InvalidCredentialsException;
import com.hms.user.dto.request.LoginRequest;
import com.hms.user.dto.response.AuthResponse;
import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;
import com.hms.user.repositories.UserRepository;
import com.hms.user.services.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private JwtService jwtService;

  @Mock
  private AuthenticationManager authenticationManager;

  @InjectMocks
  private UserServiceImpl userService;

  @Test
  @DisplayName("Deve realizar login com sucesso e retornar o Token JWT")
  void login_WithValidCredentials_ShouldReturnJwt() {
    LoginRequest request = new LoginRequest("medico@hms.com", "senha123");

    User mockUser = new User();
    mockUser.setId(10L);
    mockUser.setEmail("medico@hms.com");
    mockUser.setRole(UserRole.DOCTOR);
    mockUser.setActive(true);

    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
    when(userRepository.findByEmail("medico@hms.com")).thenReturn(Optional.of(mockUser));
    when(jwtService.generateToken(mockUser)).thenReturn("eyJhbGciOiJIUzI1NiIsInR5c...");
    when(jwtService.getExpirationTime()).thenReturn(3600000L);

    AuthResponse response = userService.login(request);

    assertNotNull(response);
    assertEquals("eyJhbGciOiJIUzI1NiIsInR5c...", response.token());

    verify(authenticationManager).authenticate(
      argThat(auth -> auth.getPrincipal().equals("medico@hms.com") && auth.getCredentials().equals("senha123"))
    );
  }

  @Test
  @DisplayName("Deve lançar InvalidCredentialsException quando a senha estiver incorreta")
  void login_WithInvalidCredentials_ShouldThrowException() {
    LoginRequest request = new LoginRequest("medico@hms.com", "senhaErrada");

    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
      .thenThrow(new BadCredentialsException("Bad credentials"));

    assertThrows(InvalidCredentialsException.class, () -> userService.login(request));

    // garante que, se a senha for errada, ele nem tenta gerar o token
    verify(userRepository, never()).findByEmail(anyString());
    verify(jwtService, never()).generateToken(any());
  }
}