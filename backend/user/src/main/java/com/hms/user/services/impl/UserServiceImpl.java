package com.hms.user.services.impl;

import com.hms.common.exceptions.ResourceAlreadyExistsException;
import com.hms.common.exceptions.ResourceNotFoundException;
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
import com.hms.user.repositories.UserRepository;
import com.hms.user.services.JwtService;
import com.hms.user.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

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
    validateEmailUnique(request.email(), null);

    User user = request.toEntity();
    user.setPassword(encoder.encode(user.getPassword()));
    user.setActive(false);

    String code = generateVerificationCode();
    user.setVerificationCode(code);
    user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));

    User savedUser = userRepository.save(user);

    String cpf = (savedUser.getRole() == UserRole.PATIENT) ? request.cpfOuCrm() : null;
    String crm = (savedUser.getRole() == UserRole.DOCTOR) ? request.cpfOuCrm() : null;

    publishUserCreatedEvent(savedUser, cpf, crm, code);
    return UserResponse.fromEntity(savedUser);
  }

  @Override
  @Transactional(readOnly = true)
  @Cacheable(value = "users", key = "#id")
  public UserResponse getUserById(Long id) {
    return userRepository.findById(id)
      .map(UserResponse::fromEntity)
      .orElseThrow(() -> new ResourceNotFoundException("User", id));
  }

  @Override
  public UserResponse getUserByEmail(String email) {
    return userRepository.findByEmail(email)
      .map(UserResponse::fromEntity)
      .orElseThrow(() -> new ResourceNotFoundException("User", email));
  }

  @Override
  @Transactional
  @CachePut(value = "users", key = "#id")
  public UserResponse updateUser(Long id, UserRequest request) {
    User user = findUserByIdOrThrow(id);
    validateEmailUnique(request.email(), id);

    user.setName(request.name());
    user.setEmail(request.email());
    user.setRole(request.role());
    user.setPassword(encoder.encode(request.password()));

    return UserResponse.fromEntity(userRepository.save(user));
  }

  @Override
  public AuthResponse login(LoginRequest request) {
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

    User user = userRepository.findByEmail(request.email())
      .orElseThrow(() -> new ResourceNotFoundException("User", request.email()));

    if (!user.isActive()) throw new IllegalStateException("Conta não verificada. Por favor, verifique seu e-mail.");

    String jwtToken = jwtService.generateToken(user);
    long expirationTime = jwtService.getExpirationTime();

    return AuthResponse.create(jwtToken, UserResponse.fromEntity(user), expirationTime);
  }

  @Override
  @Transactional
  @CacheEvict(value = "users", key = "#id")
  public void updateUserStatus(Long id, boolean active) {
    User user = findUserByIdOrThrow(id);
    user.setActive(active);
    userRepository.save(user);
  }

  @Override
  @Transactional
  public UserResponse adminCreateUser(AdminCreateUserRequest request) {
    validateEmailUnique(request.email(), null);

    User newUser = new User();
    newUser.setName(request.name());
    newUser.setEmail(request.email());
    newUser.setPassword(encoder.encode(request.password()));
    newUser.setRole(request.role());
    newUser.setActive(true);

    User savedUser = userRepository.save(newUser);
    publishUserCreatedEvent(savedUser, request.cpf(), request.crmNumber(), null);

    return UserResponse.fromEntity(savedUser);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<UserResponse> findAllUsers(Pageable pageable) {
    return userRepository.findAll(pageable).map(UserResponse::fromEntity);
  }

  @Override
  @Transactional
  @CacheEvict(value = "users", key = "#userId")
  public void adminUpdateUser(Long userId, AdminUpdateUserRequest request) {
    User user = findUserByIdOrThrow(userId);

    if (request.email() != null && !request.email().isBlank()) {
      validateEmailUnique(request.email(), userId);
      user.setEmail(request.email());
    }
    if (request.name() != null && !request.name().isBlank()) {
      user.setName(request.name());
    }

    userRepository.save(user);
    publishUserUpdatedEvent(user, request);
  }

  @Override
  @Transactional
  public void verifyAccount(String email, String code) {
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new ResourceNotFoundException("User", email));

    if (user.isActive()) throw new IllegalArgumentException("Conta já verificada.");
    if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
      throw new IllegalArgumentException("Código inválido.");
    }
    if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
      throw new IllegalArgumentException("Código expirado.");
    }

    user.setActive(true);
    user.setVerificationCode(null);
    user.setVerificationCodeExpiresAt(null);
    userRepository.save(user);
  }

  @Override
  @Transactional
  public void resendVerificationCode(String email) {
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new ResourceNotFoundException("User", email));
    if (user.isActive()) throw new IllegalArgumentException("Conta já verificada.");

    String newCode = generateVerificationCode();
    user.setVerificationCode(newCode);
    user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
    userRepository.save(user);

    publishUserCreatedEvent(user, null, null, newCode);
  }

  private User findUserByIdOrThrow(Long id) {
    return userRepository.findById(id)
      .orElseThrow(() -> new ResourceNotFoundException("User", id));
  }

  private void validateEmailUnique(String email, Long excludeId) {
    userRepository.findByEmail(email).ifPresent(u -> {
      if (!u.getId().equals(excludeId)) {
        throw new ResourceAlreadyExistsException("User", email);
      }
    });
  }

  private String generateVerificationCode() {
    return String.format("%06d", new Random().nextInt(999999));
  }

  private void publishUserCreatedEvent(User user, String cpf, String crm, String code) {
    try {
      var event = new UserCreatedEvent(user.getId(), user.getName(), user.getEmail(), user.getRole(), cpf, crm, code);
      rabbitTemplate.convertAndSend(exchange, userCreatedRoutingKey, event);
    } catch (Exception e) {
      log.error("Erro RabbitMQ UserCreated: {}", e.getMessage());
    }
  }

  private void publishUserUpdatedEvent(User user, AdminUpdateUserRequest req) {
    try {
      var event = new UserUpdatedEvent(
        user.getId(), user.getName(), user.getEmail(), user.getRole(),
        req.phoneNumber(), req.dateOfBirth(), req.cpf(), req.address(), req.emergencyContactName(), req.emergencyContactPhone(),
        req.bloodGroup(), req.gender(), req.chronicDiseases(), req.allergies(), req.crmNumber(), req.specialization(),
        req.department(), req.biography(), req.qualifications(), req.yearsOfExperience()
      );
      rabbitTemplate.convertAndSend(exchange, userUpdatedRoutingKey, event);
    } catch (Exception e) {
      log.error("Erro RabbitMQ UserUpdated: {}", e.getMessage());
    }
  }
}