package security;

import com.hms.common.security.HmsUserPrincipal;
import com.hms.common.security.SecurityUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SecurityUtilsTest {

  @Test
  @DisplayName("Deve extrair e retornar o ID do usuário quando a autenticação for válida")
  void getUserId_WithValidAuthentication_ShouldReturnId() {
    Authentication authentication = mock(Authentication.class);
    HmsUserPrincipal mockPrincipal = mock(HmsUserPrincipal.class);

    when(mockPrincipal.getId()).thenReturn(500L);
    when(authentication.getPrincipal()).thenReturn(mockPrincipal);

    Long userId = SecurityUtils.getUserId(authentication);

    assertEquals(500L, userId);
  }

  @Test
  @DisplayName("Deve lançar IllegalStateException quando a autenticação for nula")
  void getUserId_WithNullAuthentication_ShouldThrowException() {
    IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
      SecurityUtils.getUserId(null);
    });

    assertEquals("Usuário não autenticado corretamente ou Principal inválido", exception.getMessage());
  }

  @Test
  @DisplayName("Deve lançar IllegalStateException quando o principal for de tipo desconhecido (ex: usuário anônimo)")
  void getUserId_WithInvalidPrincipal_ShouldThrowException() {
    Authentication authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn("anonymousUser");

    assertThrows(IllegalStateException.class, () -> {
      SecurityUtils.getUserId(authentication);
    });
  }
}