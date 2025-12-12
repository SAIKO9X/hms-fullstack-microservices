package com.hms.pharmacy.clients;

import com.hms.pharmacy.config.FeignClientInterceptor;
import com.hms.pharmacy.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", configuration = FeignClientInterceptor.class)
public interface UserFeignClient {

  @GetMapping("/users/{id}")
  UserResponse getUserById(@PathVariable("id") Long id);
}