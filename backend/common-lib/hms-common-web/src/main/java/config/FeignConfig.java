package config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
@ConditionalOnClass(EnableFeignClients.class)
@Slf4j
public class FeignConfig {

  @Bean
  public RequestInterceptor feignClientInterceptor() {
    log.info("Registering FeignClientInterceptor for header propagation");
    return new FeignClientInterceptor();
  }

  @Bean
  @ConditionalOnProperty(name = "feign.logging.enabled", havingValue = "true", matchIfMissing = true)
  public Logger.Level feignLoggerLevel() {
    return Logger.Level.BASIC; // NONE, BASIC, HEADERS, FULL
  }

  @Bean
  public ErrorDecoder feignErrorDecoder() {
    return new HmsFeignErrorDecoder();
  }
}