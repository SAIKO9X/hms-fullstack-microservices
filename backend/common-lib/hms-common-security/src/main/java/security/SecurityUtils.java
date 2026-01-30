package security;

import org.springframework.security.core.Authentication;

public final class SecurityUtils {

  private SecurityUtils() {
    // previne instanciamento
  }

  public static Long getUserId(Authentication authentication) {
    if (authentication != null && authentication.getPrincipal() instanceof HmsUserPrincipal userPrincipal) {
      return userPrincipal.getId();
    }
    throw new IllegalStateException("Usuário não autenticado corretamente ou Principal inválido");
  }
}