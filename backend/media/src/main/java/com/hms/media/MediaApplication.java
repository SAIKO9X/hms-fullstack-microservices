package com.hms.media;

import com.hms.common.config.CommonLibAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(CommonLibAutoConfiguration.class)
public class MediaApplication {

  public static void main(String[] args) {
    SpringApplication.run(MediaApplication.class, args);
  }

}