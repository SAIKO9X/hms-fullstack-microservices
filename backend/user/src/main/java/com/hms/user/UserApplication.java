package com.hms.user;

import com.hms.common.config.CommonLibAutoConfiguration;
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
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableCaching
@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
@Import(CommonLibAutoConfiguration.class)
public class UserApplication {

  public static void main(String[] args) {
    SpringApplication.run(UserApplication.class, args);
  }

  @Bean
  public CommandLineRunner createAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    return args -> {
      String adminEmail = "admin@hms.com";

      userRepository.findByEmail(adminEmail).ifPresentOrElse(
        admin -> {
          if (!admin.isActive()) {
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println(">>> Usuário Admin já existia, mas estava inativo. Atualizado para ATIVO! <<<");
          }
        },
        () -> {
          // se não existir cria do zero
          User admin = new User();
          admin.setName("Admin User");
          admin.setEmail(adminEmail);
          admin.setPassword(passwordEncoder.encode("admin123"));
          admin.setRole(UserRole.ADMIN);
          admin.setActive(true); // admin já vem ativo
          userRepository.save(admin);
          System.out.println(">>> Usuário Admin padrão criado com sucesso e ATIVO! <<<");
        }
      );
    };
  }
}