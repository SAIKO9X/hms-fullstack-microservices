package com.hms.chat.clients;

import com.hms.common.config.FeignClientInterceptor;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "user-service", configuration = FeignClientInterceptor.class)
public interface UserFeignClient {

  // @GetMapping("/users/{id}")
  // ApiResponse<UserResponse> getUserById(@PathVariable("id") Long id);
}