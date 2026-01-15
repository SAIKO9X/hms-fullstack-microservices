package com.hms.pharmacy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableCaching
@EnableScheduling
@EnableFeignClients
@SpringBootApplication(scanBasePackages = {"com.hms.pharmacy", "com.hms.common"})
public class PharmacyApplication {

  public static void main(String[] args) {
    SpringApplication.run(PharmacyApplication.class, args);
  }

}
