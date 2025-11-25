package com.hms.chat.clients;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "user-service", path = "/users")
public interface UserFeignClient {

  // Verificar se usuário existe
  // @GetMapping("/{id}/exists")
  // Boolean userExists(@PathVariable("id") Long id);
}