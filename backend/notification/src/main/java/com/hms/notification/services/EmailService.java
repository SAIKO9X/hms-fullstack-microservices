package com.hms.notification.services;

import com.hms.common.exceptions.ServiceUnavailableException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender javaMailSender;
  private final SpringTemplateEngine templateEngine;

  public void sendEmail(String to, String subject, String body) {
    try {
      log.info("Processando template de e-mail para: {}", to);

      MimeMessage mimeMessage = javaMailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(
        mimeMessage,
        MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
        StandardCharsets.UTF_8.name()
      );

      Context context = new Context();
      context.setVariable("messageBody", body);
      context.setVariable("subject", subject);

      String htmlContent = templateEngine.process("email-template", context);

      helper.setTo(to);
      helper.setSubject(subject);
      helper.setFrom("sistema@hms.com");
      helper.setText(htmlContent, true);

      javaMailSender.send(mimeMessage);
      log.info("E-mail com template enviado com sucesso!");

    } catch (MessagingException e) {
      log.error("Falha ao enviar e-mail", e);
      throw new ServiceUnavailableException("Serviço de e-mail temporariamente indisponível: " + e.getMessage());
    }
  }
}