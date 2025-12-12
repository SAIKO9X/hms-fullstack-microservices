package com.hms.notification.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender javaMailSender;

  public void sendEmail(String to, String subject, String body) {
    try {
      log.info("Enviando e-mail para: {}", to);

      MimeMessage mimeMessage = javaMailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

      helper.setText(body, true); // envia como HTML
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setFrom("sistema@hms.com");

      javaMailSender.send(mimeMessage);
      log.info("E-mail enviado com sucesso!");

    } catch (MessagingException e) {
      log.error("Falha ao enviar e-mail", e);
      throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage());
    }
  }
}