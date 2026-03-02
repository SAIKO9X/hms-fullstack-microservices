package com.hms.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI customOpenAPI() {
    final String securitySchemeName = "bearerAuth";

    return new OpenAPI()
      .info(new Info()
        .title("HMS Microservices API")
        .description("Documentação padronizada das APIs do sistema HMS (Hospital Management System).")
        .version("v1.0.0")
        .contact(new Contact()
          .name("Equipe de Desenvolvimento HMS")
          .email("dev@hms.com")))
      // configuração global para exigir o token JWT nas requisições
      .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
      .components(new Components()
        // define o esquema de segurança do tipo Bearer JWT
        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
          .name(securitySchemeName)
          .type(SecurityScheme.Type.HTTP)
          .scheme("bearer")
          .bearerFormat("JWT")));
  }
}