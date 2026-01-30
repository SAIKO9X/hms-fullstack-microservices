package config;

import com.hms.common.exceptions.GlobalExceptionHandler;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@ComponentScan(basePackages = "com.hms.common")
@Import({
  FeignConfig.class,
  GlobalExceptionHandler.class
})
public class CommonLibAutoConfiguration {
  // configuração para auto-scan dos componentes da common-lib
}