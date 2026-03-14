package com.hms.user.clients;

import com.hms.common.dto.response.ResponseWrapper;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "profile-service")
public interface ProfileFeignClient {

  @GetMapping("/profile/patients/exists/cpf/{cpf}")
  ResponseWrapper<Boolean> checkCpfExists(@PathVariable("cpf") String cpf);

  @GetMapping("/profile/doctors/exists/crm/{crm}")
  ResponseWrapper<Boolean> checkCrmExists(@PathVariable("crm") String crm);
}