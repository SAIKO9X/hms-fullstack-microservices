package com.hms.appointment;

import com.hms.common.config.AuditConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableFeignClients
@EnableDiscoveryClient
@Import(AuditConfig.class)
@SpringBootApplication(scanBasePackages = {"com.hms.appointment", "com.hms.common"})
public class AppointmentApplication {

  public static void main(String[] args) {
    SpringApplication.run(AppointmentApplication.class, args);
  }

}
