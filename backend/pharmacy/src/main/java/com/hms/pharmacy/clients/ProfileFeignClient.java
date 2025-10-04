package com.hms.pharmacy.clients;

import com.hms.pharmacy.response.PatientProfileResponse;
import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@FeignClient(name = "profile-service", path = "/profile")
public interface ProfileFeignClient {

  @GetMapping("/patients/by-user/{userId}")
  PatientProfileResponse getPatientProfileByUserId(@PathVariable("userId") Long userId);

  @Bean
  public default RequestInterceptor requestInterceptor() {
    return requestTemplate -> {
      ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      if (attributes != null) {
        HttpServletRequest request = attributes.getRequest();
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null) {
          requestTemplate.header("Authorization", authHeader);
        }
      }
    };
  }
}