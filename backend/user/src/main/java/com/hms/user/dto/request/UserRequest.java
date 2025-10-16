package com.hms.user.dto.request;

import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserRequest(
  @NotBlank(message = "O nome não pode ser vazio")
  String name,

  @Email(message = "O email deve ser válido")
  String email,

  @Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$",
    message = "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número."
  )
  String password,

  UserRole role,

  String cpfOuCrm
) {
  public User toEntity() {
    return new User(
      null,
      this.name,
      this.email,
      this.password,
      this.role,
      true
    );
  }
}