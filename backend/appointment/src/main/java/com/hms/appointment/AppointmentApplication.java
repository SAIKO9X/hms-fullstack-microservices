package com.hms.appointment;

import com.hms.common.config.AuditConfig;
import com.hms.common.config.CommonLibAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
@Import({CommonLibAutoConfiguration.class, AuditConfig.class})
public class AppointmentApplication {

  public static void main(String[] args) {
    SpringApplication.run(AppointmentApplication.class, args);
  }
}