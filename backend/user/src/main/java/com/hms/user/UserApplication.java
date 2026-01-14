package com.hms.user;

import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;
import com.hms.user.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableCaching
@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
public class UserApplication {

  public static void main(String[] args) {
    SpringApplication.run(UserApplication.class, args);
  }

  @Bean
  public CommandLineRunner createAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    return args -> {
      String adminEmail = "admin@hms.com";
      if (userRepository.findByEmail(adminEmail).isEmpty()) {
        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("admin123")); // Senha: admin123
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);
        System.out.println(">>> Usuário Admin padrão criado com sucesso! <<<");
      }
    };
  }
}