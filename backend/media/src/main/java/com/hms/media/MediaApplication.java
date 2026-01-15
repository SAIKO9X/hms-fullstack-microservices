package com.hms.media;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.hms.media", "com.hms.common"})
public class MediaApplication {

  public static void main(String[] args) {
    SpringApplication.run(MediaApplication.class, args);
  }

}
