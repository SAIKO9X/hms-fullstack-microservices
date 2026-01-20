package com.hms.audit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication(scanBasePackages = {"com.hms.audit", "com.hms.common"})
public class AuditApplication {
  public static void main(String[] args) {
    SpringApplication.run(AuditApplication.class, args);
  }
}