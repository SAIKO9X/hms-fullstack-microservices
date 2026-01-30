package com.hms.chat.clients;

import com.hms.common.config.FeignClientInterceptor;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "user-service", path = "/users", configuration = FeignClientInterceptor.class)
public interface UserFeignClient {

  // Métodos comentados no original, mantendo estrutura
  // @GetMapping("/{id}/exists")
  // Boolean userExists(@PathVariable("id") Long id);
}