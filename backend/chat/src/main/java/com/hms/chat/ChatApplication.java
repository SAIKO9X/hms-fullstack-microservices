package com.hms.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication(scanBasePackages = {"com.hms.chat", "com.hms.common"})
public class ChatApplication {

  public static void main(String[] args) {
    SpringApplication.run(ChatApplication.class, args);
  }

}
