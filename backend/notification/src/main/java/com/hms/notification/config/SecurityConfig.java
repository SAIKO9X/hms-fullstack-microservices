package com.hms.notification.config;

import com.hms.common.security.CommonJwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final CommonJwtAuthFilter jwtAuthFilter;

  private static final String[] SWAGGER_WHITELIST = {
    "/v3/api-docs/**",
    "/swagger-ui/**",
    "/swagger-ui.html",
    "/swagger-resources/**",
    "/webjars/**"
  };

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(AbstractHttpConfigurer::disable)
      .sessionManagement(session -> session
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/actuator/**").permitAll()
        .requestMatchers(SWAGGER_WHITELIST).permitAll()
        .requestMatchers("/api/v1/auth/**").permitAll()
        .anyRequest().authenticated()
      )
      .exceptionHandling(e -> e
        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
      )
      .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}