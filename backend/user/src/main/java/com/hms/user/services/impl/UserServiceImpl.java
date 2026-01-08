package com.hms.user.services.impl;

import com.hms.user.dto.event.UserCreatedEvent;
import com.hms.user.dto.event.UserUpdatedEvent;
import com.hms.user.dto.request.AdminCreateUserRequest;
import com.hms.user.dto.request.AdminUpdateUserRequest;
import com.hms.user.dto.request.LoginRequest;
import com.hms.user.dto.request.UserRequest;
import com.hms.user.dto.response.AuthResponse;
import com.hms.user.dto.response.UserResponse;
import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;
import com.hms.user.exceptions.UserAlreadyExistsException;
import com.hms.user.exceptions.UserNotFoundException;
import com.hms.user.repositories.UserRepository;
import com.hms.user.services.JwtService;
import com.hms.user.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder encoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final RabbitTemplate rabbitTemplate;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.user-created-routing-key}")
  private String userCreatedRoutingKey;

  @Value("${application.rabbitmq.user-updated-routing-key:user.event.updated}")
  private String userUpdatedRoutingKey;

  @Override
  @Transactional
  public UserResponse createUser(UserRequest request) {
    if (userRepository.findByEmail(request.email()).isPresent()) {
      throw new UserAlreadyExistsException("Um usuário com o email: '" + request.email() + "' já foi cadastrado.");
    }

    User user = request.toEntity();
    user.setPassword(encoder.encode(user.getPassword()));
    User savedUser = userRepository.save(user);
    String cpf = null;
    String crm = null;

    if (savedUser.getRole() == UserRole.PATIENT) {
      cpf = request.cpfOuCrm();
    } else if (savedUser.getRole() == UserRole.DOCTOR) {
      crm = request.cpfOuCrm();
    }

    publishUserCreatedEvent(savedUser, cpf, crm);

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

    var jwtToken = jwtService.generateToken(user);
    var expirationTime = jwtService.getExpirationTime();

    return AuthResponse.create(jwtToken, UserResponse.fromEntity(user), expirationTime);
  }

  @Override
  @Transactional
  public void updateUserStatus(Long id, boolean active) {
    User userToUpdate = userRepository.findById(id)
      .orElseThrow(() -> new UserNotFoundException("Utilizador com ID " + id + " não encontrado."));
    userToUpdate.setActive(active);
    userRepository.save(userToUpdate);
  }

  @Override
  @Transactional
  public UserResponse adminCreateUser(AdminCreateUserRequest request) {
    if (userRepository.findByEmail(request.email()).isPresent()) {
      throw new UserAlreadyExistsException("O email " + request.email() + " já está em uso.");
    }

    User newUser = new User();
    newUser.setName(request.name());
    newUser.setEmail(request.email());
    newUser.setPassword(encoder.encode(request.password()));
    newUser.setRole(request.role());
    newUser.setActive(true);

    User savedUser = userRepository.save(newUser);
    String cpf = request.cpf();
    String crm = request.crmNumber();

    publishUserCreatedEvent(savedUser, cpf, crm);

    return UserResponse.fromEntity(savedUser);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<UserResponse> findAllUsers(Pageable pageable) {
    return userRepository.findAll(pageable)
      .map(UserResponse::fromEntity);
  }

  @Override
  @Transactional
  public void adminUpdateUser(Long userId, AdminUpdateUserRequest request) {
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new UserNotFoundException("Utilizador não encontrado com o ID: " + userId));

    if (request.email() != null && !request.email().isBlank()) {
      Optional<User> userWithNewEmail = userRepository.findByEmail(request.email());
      if (userWithNewEmail.isPresent() && !userWithNewEmail.get().getId().equals(userId)) {
        throw new UserAlreadyExistsException("O e-mail '" + request.email() + "' já está em uso.");
      }
      user.setEmail(request.email());
    }

    if (request.name() != null && !request.name().isBlank()) {
      user.setName(request.name());
    }

    userRepository.save(user);

    publishUserUpdatedEvent(user, request);
  }

  // Método auxiliar para publicar o evento
  private void publishUserCreatedEvent(User user, String cpf, String crm) {
    try {
      UserCreatedEvent event = new UserCreatedEvent(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        cpf,
        crm
      );

      rabbitTemplate.convertAndSend(exchange, userCreatedRoutingKey, event);
      log.info("Evento de criação de usuário enviado para fila: ID {}", user.getId());
    } catch (Exception e) {
      log.error("Erro ao enviar evento de criação de usuário para o RabbitMQ", e);
    }
  }

  // Método auxiliar para publicar o evento de atualização
  private void publishUserUpdatedEvent(User user, AdminUpdateUserRequest req) {
    try {
      UserUpdatedEvent event = new UserUpdatedEvent(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),

        req.phoneNumber(),
        req.dateOfBirth(),

        req.cpf(),
        req.address(),
        req.emergencyContactName(),
        req.emergencyContactPhone(),
        req.bloodGroup(),
        req.gender(),
        req.chronicDiseases(),
        req.allergies(),

        req.crmNumber(),
        req.specialization(),
        req.department(),
        req.biography(),
        req.qualifications(),
        req.yearsOfExperience()
      );

      rabbitTemplate.convertAndSend(exchange, userUpdatedRoutingKey, event);
      log.info("Evento de atualização de usuário enviado: ID {}, Role {}", user.getId(), user.getRole());

    } catch (Exception e) {
      log.error("Erro ao publicar atualização de usuário para ID {}: {}", user.getId(), e.getMessage(), e);
    }
  }
}