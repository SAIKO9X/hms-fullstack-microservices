package com.hms.common.config;

import com.hms.common.exceptions.GlobalExceptionHandler;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@ComponentScan(basePackages = "com.hms.common")
@Import({
  FeignConfig.class,
  GlobalExceptionHandler.class,
  OpenApiConfig.class
})
public class CommonLibAutoConfiguration {
}