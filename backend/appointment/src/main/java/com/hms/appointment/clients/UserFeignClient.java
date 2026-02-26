package com.hms.appointment.clients;

import com.hms.appointment.dto.external.UserResponse;
import com.hms.common.config.FeignClientInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
  name = "user-service",
  url = "${feign.user-service.url:}",
  configuration = FeignClientInterceptor.class
)
public interface UserFeignClient {

  @GetMapping("/users/{id}")
  UserResponse getUserById(@PathVariable("id") Long id);
}