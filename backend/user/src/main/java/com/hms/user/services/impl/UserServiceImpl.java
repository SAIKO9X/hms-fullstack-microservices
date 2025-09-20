package com.hms.user.services.impl;

import com.hms.user.clients.ProfileFeignClient;
import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;
import com.hms.user.exceptions.UserAlreadyExistsException;
import com.hms.user.exceptions.UserNotFoundException;
import com.hms.user.repositories.UserRepository;
import com.hms.user.request.DoctorCreateRequest;
import com.hms.user.request.LoginRequest;
import com.hms.user.request.PatientCreateRequest;
import com.hms.user.request.UserRequest;
import com.hms.user.response.AuthResponse;
import com.hms.user.response.UserResponse;
import com.hms.user.services.JwtService;
import com.hms.user.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder encoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final ProfileFeignClient profileFeignClient;

  @Override
  public UserResponse createUser(UserRequest request) {
    if (userRepository.findByEmail(request.email()).isPresent()) {
      throw new UserAlreadyExistsException("Um usuário com o email: '" + request.email() + "' já foi cadastrado.");
    }

    User user = request.toEntity();
    user.setPassword(encoder.encode(user.getPassword()));

    // Salva o usuário primeiro para ter o ID
    User savedUser = userRepository.save(user);

    try {
      // Tenta criar o perfil no outro serviço
      if (savedUser.getRole() == UserRole.PATIENT) {
        profileFeignClient.createPatientProfile(new PatientCreateRequest(savedUser.getId(), request.cpfOuCrm()));
      } else if (savedUser.getRole() == UserRole.DOCTOR) {
        profileFeignClient.createDoctorProfile(
          new DoctorCreateRequest(savedUser.getId(), request.cpfOuCrm(), savedUser.getName())
        );
      }
    } catch (Exception e) {
      // AÇÃO DE COMPENSAÇÃO - se a criação do perfil falhou, desfaz a criação do usuário!
      System.err.println("Falha ao criar perfil. Iniciando rollback manual para o usuário: " + savedUser.getId());
      userRepository.deleteById(savedUser.getId());

      // Lança a exceção original para que o frontend saiba que falhou
      throw new RuntimeException("Falha na comunicação com o serviço de perfil. O usuário não foi criado. Causa: " + e.getMessage(), e);
    }

    return UserResponse.fromEntity(savedUser);
  }


  @Override
  @Transactional(readOnly = true)
  public UserResponse getUserById(Long id) {
    User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("Usuário com ID " + id + " não encontrado."));
    return UserResponse.fromEntity(user);
  }

  @Override
  public UserResponse getUserByEmail(String email) {
    return userRepository.findByEmail(email)
      .map(UserResponse::fromEntity)
      .orElseThrow(() -> new UserNotFoundException("Usuário com e-mail " + email + " não encontrado."));
  }

  @Override
  @Transactional
  public UserResponse updateUser(Long id, UserRequest request) {
    User userToUpdate = userRepository.findById(id)
      .orElseThrow(() -> new UserNotFoundException("Usuário com ID " + id + " não encontrado."));

    Optional<User> userWithNewEmail = userRepository.findByEmail(request.email());
    if (userWithNewEmail.isPresent() && !userWithNewEmail.get().getId().equals(id)) {
      throw new UserAlreadyExistsException("O e-mail '" + request.email() + "' já está em uso por outro usuário.");
    }

    userToUpdate.setName(request.name());
    userToUpdate.setEmail(request.email());
    userToUpdate.setRole(request.role());

    userToUpdate.setPassword(encoder.encode(request.password()));

    User updatedUser = userRepository.save(userToUpdate);

    return UserResponse.fromEntity(updatedUser);
  }

  @Override
  public AuthResponse login(LoginRequest request) {
    // Deixa o Spring Security validar o usuário e a senha
    authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(
        request.email(),
        request.password()
      )
    );

    var user = userRepository.findByEmail(request.email())
      .orElseThrow(() -> new IllegalStateException("Usuário não encontrado após autenticação."));

    // Gera o token JWT
    var jwtToken = jwtService.generateToken(user);
    var expirationTime = jwtService.getExpirationTime();

    return AuthResponse.create(jwtToken, UserResponse.fromEntity(user), expirationTime);
  }
}
