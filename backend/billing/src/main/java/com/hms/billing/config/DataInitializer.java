package com.hms.billing.config;

import com.hms.billing.entities.InsuranceProvider;
import com.hms.billing.repositories.InsuranceProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final InsuranceProviderRepository providerRepository;

  @Override
  public void run(String... args) throws Exception {
    if (providerRepository.count() == 0) {
      InsuranceProvider unimed = InsuranceProvider.builder()
        .name("Unimed")
        .coveragePercentage(new BigDecimal("0.80")) // Cobre 80%
        .active(true)
        .build();

      InsuranceProvider amil = InsuranceProvider.builder()
        .name("Amil")
        .coveragePercentage(new BigDecimal("0.50")) // Cobre 50%
        .active(true)
        .build();

      InsuranceProvider particular = InsuranceProvider.builder()
        .name("Particular (Sem Convênio)")
        .coveragePercentage(BigDecimal.ZERO)
        .active(true)
        .build();

      providerRepository.saveAll(Arrays.asList(unimed, amil, particular));
      System.out.println("Seguradoras iniciais cadastradas no Billing Service.");
    }
  }
}